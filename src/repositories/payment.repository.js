const { Sequelize } = require("sequelize");
const { Payment, Booking } = require("../models");

class PaymentRepository {
    async getTotalPaid(bookingNumber) {
        return (
            (await Payment.sum("amount", {
                where: { booking_number: bookingNumber }
            })) || 0
        );
    }

    async createPayment(data, transaction = null) {
        return Payment.create(data, { transaction });
    }

    async getBookingPaymentSummary() {
        return Booking.findAll({
            attributes: [
                "booking_number",
                "final_amount",
                [
                    Sequelize.literal(`(
            SELECT COALESCE(SUM(amount), 0)
            FROM payments p
            WHERE p.booking_number = Booking.booking_number
          )`),
                    "total_paid"
                ],
                [
                    Sequelize.literal(`(
            SELECT COALESCE(SUM(amount), 0)
            FROM refunds r
            WHERE r.booking_number = Booking.booking_number
          )`),
                    "total_refunded"
                ]
            ],
            order: [["created_at", "DESC"]],
            raw: true
        });
    }

    async getPaymentsByBooking(bookingNumber) {
        return Payment.findAll({
            where: { booking_number: bookingNumber },
            order: [["payment_date", "ASC"]]
        });
    }
}

module.exports = new PaymentRepository();
