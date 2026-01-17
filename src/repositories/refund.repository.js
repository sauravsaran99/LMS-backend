const { Refund } = require("../models");

class RefundRepository {
    async getTotalRefunded(bookingNumber) {
        return (
            (await Refund.sum("amount", {
                where: { booking_number: bookingNumber }
            })) || 0
        );
    }

    async createRefund(data, transaction = null) {
        return Refund.create(data, { transaction });
    }
}

module.exports = new RefundRepository();
