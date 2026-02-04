const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const customerUpload = require("../middlewares/customerUpload.middleware");

router.use(auth, authorize(["RECEPTIONIST", "CUSTOMER"]));

router.post("/", customerUpload.single("profile_image"), customerController.createCustomer);

router.get("/search", customerController.searchCustomers);

router.get("/", customerController.getCustomers);
router.put("/:id", customerUpload.single("profile_image"), customerController.updateCustomer);
router.patch("/:id/status", customerController.toggleStatus);

router.get("/me", customerController.getMe);

router.get("/bookings", customerController.getMyBookings);

router.get("/bookings/:bookingId/tests", customerController.getBookingTests);

router.get(
  "/bookings/:bookingId/reports",
  customerController.getBookingReports,
);

router.get(
  "/bookings/:bookingNumber/payments",
  customerController.getBookingPayments,
);

module.exports = router;
