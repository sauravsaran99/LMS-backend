const customerService = require("../services/customer.service");
const { createCustomerSchema } = require("../validators/customer.validator");

exports.createCustomer = async (req, res) => {
  try {
    const { error, value } = createCustomerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const customer = await customerService.createCustomer(value, req.user);

    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.searchCustomers = async (req, res) => {
  try {
    const customers = await customerService.searchCustomers(req.query.q);
    res.json(customers);
  } catch {
    res.status(500).json({ message: "Failed to search customers" });
  }
};

exports.getCustomers = async (req, res) => {
  const customers = await customerService.getCustomers(req.user);
  res.json(customers);
};

exports.updateCustomer = async (req, res) => {
  try {
    await customerService.updateCustomer(req.params.id, req.body, req.user);
    res.json({ message: "Customer updated" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    await customerService.toggleStatus(req.params.id, req.user);
    res.json({ message: "Status updated" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    customer_id: req.user.customer_id,
    name: req.user.name,
    email: req.user.email,
  });
};

exports.getMyBookings = async (req, res) => {
  try {
    const data = await customerService.getMyBookings(req.user);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getBookingTests = async (req, res) => {
  try {
    const data = await customerService.getBookingTests(
      req.params.bookingId,
      req.user,
    );
    res.json(data);
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
};

exports.getBookingReports = async (req, res) => {
  try {
    const data = await customerService.getBookingReports(
      req.params.bookingId,
      req.user,
    );
    res.json(data);
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
};

exports.getBookingPayments = async (req, res) => {
  try {
    const data = await customerService.getBookingPayments(
      req.params.bookingNumber,
      req.user,
    );
    res.json(data);
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
};
