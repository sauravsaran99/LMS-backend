const paymentService = require("../services/payment.service");

exports.createPayment = async (req, res) => {
    try {
        console.log('req.body', req.body)
        const payload = {
            ...req.body,
            proof_url: req.file ? `uploads/payments/${req.file.filename}` : null
        };



        const result = await paymentService.addPayment(payload, req.user);
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};


exports.getPaymentSummary = async (req, res) => {
    try {
        const result = await paymentService.getPaymentSummary(
            req.params.booking_number
        );
        res.json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

exports.getBookingPayments = async (req, res) => {
    try {
        const data = await paymentService.getBookingPayments();
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};