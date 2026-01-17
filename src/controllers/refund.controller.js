const refundService = require("../services/refund.service");

exports.createRefund = async (req, res) => {
    try {
        const result = await refundService.issueRefund(req.body, req.user);
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};
