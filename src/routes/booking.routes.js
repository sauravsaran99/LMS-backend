const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const uploadReport = require("../middlewares/reportUpload.middleware");

router.use(auth);

router.post(
  "/",
  authorize(["SUPER_ADMIN", "BRANCH_ADMIN", "RECEPTIONIST"]),
  bookingController.createBooking,
);

router.post(
  "/:bookingId/assign-technician",
  auth,
  authorize(["SUPER_ADMIN", "BRANCH_ADMIN", "RECEPTIONIST"]),
  bookingController.assignTechnician,
);

router.get(
  "/",
  auth,
  authorize(["SUPER_ADMIN", "BRANCH_ADMIN", "RECEPTIONIST", "TECHNICIAN"]),
  bookingController.getBookings,
);

router.post(
  "/technician/:id/upload-report",
  authorize("TECHNICIAN"),
  uploadReport.single("report"),
  bookingController.uploadTestReport,
);

module.exports = router;
