const bookingRepo = require("../repositories/booking.repository");
const paymentRepo = require("../repositories/payment.repository");
const refundRepo = require("../repositories/refund.repository");

class RefundService {

    async issueRefund(payload, user) {
        const {
            booking_number,
            amount,
            refund_mode,
            reference_no
        } = payload;

        // 1️⃣ Validate booking
        const booking = await bookingRepo.getByBookingNumber(booking_number);
        if (!booking) throw new Error("Booking not found");

        // 2️⃣ Get total paid
        const totalPaid = await paymentRepo.getTotalPaid(booking_number);
        if (totalPaid <= 0) {
            throw new Error("No payment found for this booking");
        }

        // 3️⃣ Get total refunded so far
        const totalRefunded = await refundRepo.getTotalRefunded(booking_number);

        const refundableAmount = Number(totalPaid) - Number(totalRefunded);

        // 4️⃣ Validate refund amount
        if (amount <= 0) {
            throw new Error("Invalid refund amount");
        }

        if (amount > refundableAmount) {
            throw new Error("Refund exceeds refundable amount");
        }

        // 5️⃣ Resolve role
        if (!["RECEPTIONIST", "BRANCH_ADMIN"].includes(user.role)) {
            throw new Error("Unauthorized to issue refund");
        }

        // 6️⃣ Create refund ledger entry
        await refundRepo.createRefund({
            booking_number,
            amount,
            refund_mode,
            reference_no: reference_no || null,
            refunded_by_role: user.role,
            refunded_by_user_id: user.id,
            refunded_at: new Date(),
        });

        // 7️⃣ Derived summary
        const updatedRefunded = Number(totalRefunded) + Number(amount);
        const netPaid = Number(totalPaid) - updatedRefunded;

        return {
            booking_number,
            total_paid: totalPaid,
            total_refunded: updatedRefunded,
            net_paid: netPaid,
        };
    }
}

module.exports = new RefundService();
