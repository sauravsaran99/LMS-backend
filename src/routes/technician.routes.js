const express = require('express');
const router = express.Router();

const technicianController = require('../controllers/technician.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.use(auth);

router.get(
    "/bookings",
    auth,
    authorize(["TECHNICIAN"]),
    technicianController.getBookings
);

router.post(
    "/bookings/:bookingId/collect-sample",
    auth,
    authorize(["TECHNICIAN"]),
    technicianController.collectSample
);

router.post(
    "/bookings/:bookingId/complete",
    auth,
    authorize(["TECHNICIAN"]),
    technicianController.markCompleted
);

router.get(
    "/bookings/completed",
    auth,
    authorize(["TECHNICIAN"]),
    technicianController.getCompletedBookings
);




module.exports = router