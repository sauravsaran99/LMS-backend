const { Sequelize } = require("sequelize");
const { Payment, Booking } = require("../models");
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

  async getBookingPaymentSummary(pagination = null) {
    const options = {
      attributes: [
        "booking_number",
        "final_amount",
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
      order: [["created_at", "DESC"]],
      raw: true,
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Booking.count();
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
