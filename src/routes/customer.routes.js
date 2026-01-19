const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

router.use(auth, authorize(["RECEPTIONIST", "CUSTOMER"]));

router.post("/", customerController.createCustomer);

router.get("/search", customerController.searchCustomers);

router.get("/", customerController.getCustomers);
router.put("/:id", customerController.updateCustomer);
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
