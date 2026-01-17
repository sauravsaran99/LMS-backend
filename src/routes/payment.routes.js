const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload');

router.use(auth);

router.post(
    "/",
    auth,
    authorize(["RECEPTIONIST", "TECHNICIAN"]),
    upload.single('proof'),
    paymentController.createPayment
);

router.get(
    "/summary/:booking_number",
    auth,
    authorize(["RECEPTIONIST", "TECHNICIAN"]),
    paymentController.getPaymentSummary
);

router.get(
    "/bookings",
    auth,
    authorize(["RECEPTIONIST", "TECHNICIAN", "BRANCH_ADMIN"]),
    paymentController.getBookingPayments
);




module.exports = router;