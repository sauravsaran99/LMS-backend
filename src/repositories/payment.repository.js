const { Sequelize, Op } = require("sequelize");
const { Payment, Booking, Test, Customer, BookingTest } = require("../models");
const { calculateOffset } = require("../utils/pagination.util");

class PaymentRepository {
  async getTotalPaid(bookingNumber) {
    return (
      (await Payment.sum("amount", {
        where: { booking_number: bookingNumber },
      })) || 0
    );
  }

  async createPayment(data, transaction = null) {
    return Payment.create(data, { transaction });
  }

  // async getBookingPaymentSummary(pagination = null) {
  //   const options = {
  //     attributes: [
  //       "booking_number",
  //       "final_amount",
  //       [
  //         Sequelize.literal(`(
  //           SELECT COALESCE(SUM(amount), 0)
  //           FROM payments p
  //           WHERE p.booking_number = Booking.booking_number
  //         )`),
  //         "total_paid",
  //       ],
  //       [
  //         Sequelize.literal(`(
  //           SELECT COALESCE(SUM(amount), 0)
  //           FROM refunds r
  //           WHERE r.booking_number = Booking.booking_number
  //         )`),
  //         "total_refunded",
  //       ],
  //     ],
  //     order: [["created_at", "DESC"]],
  //     raw: true,
  //   };

  //   if (pagination) {
  //     options.limit = pagination.limit;
  //     options.offset = pagination.offset;
  //   }

  //   if (pagination) {
  //     const total = await Booking.count();
  //     const bookings = await Booking.findAll(options);
  //     return { bookings, total };
  //   }

  //   return Booking.findAll(options);
  // }

  async getBookingPaymentSummary(params = null, user) {
    const { page, limit, test_id, customer_id, booking_number } = params || {};
    const options = {
      attributes: [
        "booking_number",
        "final_amount",
        "created_at",
        [
          Sequelize.literal(`(
          SELECT COALESCE(SUM(amount), 0)
          FROM payments p
          WHERE p.booking_number = Booking.booking_number
        )`),
          "total_paid",
        ],
        [
          Sequelize.literal(`(
          SELECT COALESCE(SUM(amount), 0)
          FROM refunds r
          WHERE r.booking_number = Booking.booking_number
        )`),
          "total_refunded",
        ],
      ],
      order: [[Sequelize.col('created_at'), 'DESC']],

      // raw: true, // Removed to fix property access with includes
      where: {},
      include: [],
      distinct: true,
    };

    // 🔍 FILTER: Customer
    if (customer_id) {
      options.where.customer_id = customer_id;
    }

    // 🔍 FILTER: Booking Number
    if (booking_number) {
      options.where.booking_number = { [Op.like]: `%${booking_number}%` };
    }

    // 🔍 FILTER: Test
    if (test_id) {
      options.include.push({
        model: BookingTest,
        as: 'bookingTests',
        required: true,
        where: { test_id: test_id }
      });
    }

    // 🔐 ROLE-BASED FILTER (ONLY THIS LOGIC)
    if (user) {
      if (["BRANCH_ADMIN", "RECEPTIONIST"].includes(user.role)) {
        options.where.branch_id = user.base_branch_id;
      }

      if (user.role === "TECHNICIAN") {
        options.where.technician_id = user.id;
      }

      if (user.role === "CUSTOMER") {
        options.where.customer_id = user.customer_id;
      }
    }

    if (limit && page) {
      options.limit = parseInt(limit);
      options.offset = calculateOffset(page, limit);
    }

    if (limit && page) {
      const total = await Booking.count({
        where: options.where,
        include: options.include,
        distinct: true,
      });
      const bookings = await Booking.findAll(options);
      return { bookings, total };
    }

    return Booking.findAll(options);
  }

  async getPaymentsByBooking(bookingNumber, pagination = null) {
    const options = {
      where: { booking_number: bookingNumber },
      order: [["payment_date", "ASC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Payment.count({
        where: { booking_number: bookingNumber },
      });
      const payments = await Payment.findAll(options);
      return { payments, total };
    }

    return Payment.findAll(options);
  }
}

module.exports = new PaymentRepository();
