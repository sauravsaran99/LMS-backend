const {
  Booking,
  BookingTest,
  Test,
  Customer,
  AuditLog,
  User
} = require('../models');

class BookingRepository {
  async getCustomerById(id) {
    return Customer.findByPk(id);
  }

  async getTestsByIds(ids) {
    return Test.findAll({
      where: { id: ids, is_active: true }
    });
  }

  async createBooking(data, transaction) {
    return Booking.create(data, { transaction });
  }

  async createBookingTests(bookingId, tests, transaction) {
    for (const test of tests) {
      await BookingTest.create(
        {
          booking_id: bookingId,
          test_id: test.id,
          price_snapshot: test.price
        },
        { transaction }
      );
    }
  }


  async createAuditLog(data, transaction) {
    return AuditLog.create(data, { transaction });
  }

  async findById(id, options = {}) {
    return Booking.findByPk(id, options);
  }

  async findByBookingNumber(bookingNumber, options = {}) {
    if (!bookingNumber) {
      throw new Error("booking_number is required");
    }

    return Booking.findOne({
      where: { booking_number: bookingNumber },
      ...options
    });
  }


  async updateTechnicianAndStatus(
    bookingId,
    technicianId,
    status,
    transaction
  ) {
    return Booking.update(
      {
        technician_id: technicianId,
        status,
      },
      {
        where: { id: bookingId },
        transaction,
      }
    );
  }

  async findByStatus(where) {
    return Booking.findAll({
      where,
      include: [
        { model: Customer, attributes: ["id", "name"] },
        { model: User, as: "technician", attributes: ["id", "name"] },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async findAll(whereClause) {
    return Booking.findAll({
      where: whereClause, // ✅ ALWAYS OBJECT
      include: [
        { model: Customer, attributes: ["id", "name", "phone"] },
        { model: User, as: "technician", attributes: ["id", "name"] },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async findForTechnician(technicianId) {
    return Booking.findAll({
      where: {
        technician_id: technicianId,
        status: ["TECH_ASSIGNED", "SAMPLE_COLLECTED"],
      },
      include: [
        { model: Customer, attributes: ["id", "name"] },
      ],
      order: [["scheduled_date", "ASC"]],
    });
  }

  async updateStatus(bookingId, status, transaction) {
    return Booking.update(
      { status },
      { where: { id: bookingId }, transaction }
    );
  }

  async findCompletedForTechnician(technicianId) {
    return Booking.findAll({
      where: {
        technician_id: technicianId,
        status: "COMPLETED",
      },
      include: [
        { model: Customer, attributes: ["id", "name"] },
      ],
      order: [["updated_at", "DESC"]],
    });
  }

  async getByBookingNumber(bookingNumber) {
    return Booking.findOne({
      where: { booking_number: bookingNumber }
    });
  }

}

module.exports = new BookingRepository();
