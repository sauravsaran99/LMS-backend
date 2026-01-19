const bookingRepo = require("../repositories/booking.repository");
const { calculateDiscount } = require("../utils/discount.util");
const { validateDiscount } = require("../utils/discount.validator");
const { generateBookingNumber } = require("../utils/bookingNumber.util");
const { Booking, sequelize, AuditLog } = require("../models");
const { isPastBooking } = require("../utils/dateTime.validator");
const BookingReport = require("../models/bookingReport.model");

class BookingService {
  async createBooking(payload, user) {
    const transaction = await Booking.sequelize.transaction();

    try {
      const {
        customer_id,
        test_ids,
        scheduled_date,
        scheduled_time,
        discount_type,
        discount_value,
      } = payload;

      // ❗ STEP 0: Validate booking date & time
      if (isPastBooking(scheduled_date, scheduled_time)) {
        throw new Error("Cannot book tests in the past");
      }

      // 1. Validate customer
      const customer = await bookingRepo.getCustomerById(customer_id);
      if (!customer) throw new Error("Customer not found");

      // 2. Fetch tests
      const tests = await bookingRepo.getTestsByIds(test_ids);
      if (!tests.length) throw new Error("No valid tests selected");

      // 3. Calculate original amount
      const originalAmount = tests.reduce(
        (sum, test) => sum + Number(test.price),
        0,
      );

      // 4. Apply discount
      let discountResult = {
        original_amount: originalAmount,
        discount_amount: 0,
        final_amount: originalAmount,
      };

      if (discount_type && discount_value) {
        if (!validateDiscount({ type: discount_type, value: discount_value })) {
          throw new Error("Invalid discount");
        }

        discountResult = calculateDiscount({
          amount: originalAmount,
          type: discount_type,
          value: discount_value,
        });
      }

      // 5. Create booking
      const booking = await bookingRepo.createBooking(
        {
          booking_number: generateBookingNumber(),
          customer_id,
          branch_id: customer.base_branch_id,
          scheduled_date,
          scheduled_time,
          original_amount: discountResult.original_amount,
          discount_type,
          discount_value,
          discount_amount: discountResult.discount_amount,
          final_amount: discountResult.final_amount,
        },
        transaction,
      );

      // 6. Create booking_tests
      await bookingRepo.createBookingTests(booking.id, tests, transaction);

      // 7. Audit log
      await bookingRepo.createAuditLog(
        {
          action_type: "CREATE",
          entity: "Booking",
          entity_id: booking.id,
          new_value: booking,
          user_id: user.id,
          role: user.role,
          branch_id: booking.branch_id,
        },
        transaction,
      );

      await transaction.commit();
      return booking;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async assignTechnician({ bookingId, technicianId, user }) {
    return sequelize.transaction(async (t) => {
      const booking = await bookingRepo.findById(bookingId, {
        transaction: t,
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== "CREATED") {
        throw new Error(
          "Technician can only be assigned when booking is in CREATED state",
        );
      }

      await bookingRepo.updateTechnicianAndStatus(
        bookingId,
        technicianId,
        "TECH_ASSIGNED",
        t,
      );

      await AuditLog.create({
        action: "TECHNICIAN_ASSIGNED",
        action_type: "UPDATE",
        entity: "BOOKING",
        entity_id: bookingId,
        old_value: { technician_id: booking.technician_id },
        new_value: { technician_id: technicianId },
        user_id: user.id,
        role: user.role,
        branch_id: user.base_branch_id,
        transaction: t,
      });
    });
  }

  async getBookingsByStatus({ status, user }) {
    const where = {
      status, // "CREATED"
    };

    // Technician should see only assigned bookings
    if (user.role_id) {
      // Only apply technician filter when role is TECHNICIAN
      // (You already know role_id mapping)
      if (user.role_name === "TECHNICIAN") {
        where.technician_id = user.id;
      }
    }

    return bookingRepo.findAll(where);
  }

  async getTechnicianBookings(user) {
    if (user.role !== "TECHNICIAN") {
      throw new Error("Access denied");
    }

    return bookingRepo.findForTechnician(user.id);
  }

  async collectSample({ bookingId, user }) {
    return sequelize.transaction(async (t) => {
      const booking = await bookingRepo.findById(bookingId, {
        transaction: t,
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.technician_id !== user.id) {
        throw new Error("Not assigned to this booking");
      }

      if (booking.status !== "TECH_ASSIGNED") {
        throw new Error(
          "Sample can only be collected for TECH_ASSIGNED bookings",
        );
      }

      await bookingRepo.updateStatus(bookingId, "SAMPLE_COLLECTED", t);

      await AuditLog.create({
        action: "SAMPLE_COLLECTED",
        action_type: "UPDATE",
        entity: "BOOKING",
        entity_id: bookingId,
        old_value: { status: booking.status },
        new_value: { status: "SAMPLE_COLLECTED" },
        user_id: user.id,
        role: user.role,
        branch_id: user.base_branch_id,
        transaction: t,
      });
    });
  }

  async markCompleted({ bookingId, user }) {
    return sequelize.transaction(async (t) => {
      const booking = await bookingRepo.findById(bookingId, {
        transaction: t,
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.technician_id !== user.id) {
        throw new Error("Not assigned to this booking");
      }

      if (booking.status !== "SAMPLE_COLLECTED") {
        throw new Error(
          "Booking can only be completed after sample collection",
        );
      }

      await bookingRepo.updateStatus(bookingId, "COMPLETED", t);

      await AuditLog.create({
        action: "BOOKING_COMPLETED",
        action_type: "UPDATE",
        entity: "BOOKING",
        entity_id: bookingId,
        old_value: { status: booking.status },
        new_value: { status: "COMPLETED" },
        user_id: user.id,
        role: user.role,
        branch_id: user.base_branch_id,
        transaction: t,
      });
    });
  }

  async getCompletedBookingsForTechnician(user) {
    if (user.role !== "TECHNICIAN") {
      throw new Error("Access denied");
    }

    return bookingRepo.findCompletedForTechnician(user.id);
  }

  async uploadTestReport(bookingId, filePath, user) {
    if (user.role !== "TECHNICIAN") {
      throw new Error("Unauthorized");
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw new Error("Booking not found");

    if (booking.technician_id !== user.id) {
      throw new Error("Not assigned to this booking");
    }

    if (!["SAMPLE_COLLECTED", "COMPLETED"].includes(booking.status)) {
      throw new Error("Reports can only be uploaded after sample collection");
    }

    const report = await BookingReport.create({
      booking_id: booking.id,
      file_url: filePath,
      uploaded_by_user_id: user.id,
      uploaded_by_role: "TECHNICIAN",
    });

    await AuditLog.create({
      action: "REPORT_UPLOADED",
      action_type: "CREATE",
      entity: "BOOKING_REPORT",
      entity_id: report.id,
      new_value: { file_url: filePath },
      user_id: user.id,
      role: user.role,
      branch_id: booking.branch_id,
    });

    return report;
  }
}

module.exports = new BookingService();
