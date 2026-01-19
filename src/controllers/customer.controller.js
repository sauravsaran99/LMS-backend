const customerService = require("../services/customer.service");
const { createCustomerSchema } = require("../validators/customer.validator");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

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
    const paginationParams = getPaginationParams(req.query);
    const result = await customerService.searchCustomers(
      req.query.q,
      paginationParams,
    );

    if (Array.isArray(result)) {
      // No pagination data
      res.json(result);
    } else if (result.customers) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.customers,
          result.total,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      res.json(result);
    }
  } catch {
    res.status(500).json({ message: "Failed to search customers" });
  }
};

exports.getCustomers = async (req, res) => {
  const paginationParams = getPaginationParams(req.query);
  const result = await customerService.getCustomers(req.user, paginationParams);

  if (result.rows) {
    // Pagination with findAndCountAll
    res.json(
      getPaginatedResponse(
        result.rows,
        result.count,
        paginationParams.page,
        paginationParams.limit,
      ),
    );
  } else {
    // Legacy response
    res.json(result);
  }
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
    const paginationParams = getPaginationParams(req.query);
    const result = await customerService.getMyBookings(
      req.user,
      paginationParams,
    );

    if (result.rows) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.rows,
          result.count,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response
      res.json(result);
    }
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getBookingTests = async (req, res) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await customerService.getBookingTests(
      req.params.bookingId,
      req.user,
      paginationParams,
    );

    if (result.rows) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.rows,
          result.count,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response
      res.json(result);
    }
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
};

exports.getBookingReports = async (req, res) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await customerService.getBookingReports(
      req.params.bookingId,
      req.user,
      paginationParams,
    );

    if (result.rows) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.rows,
          result.count,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response
      res.json(result);
    }
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
};

exports.getBookingPayments = async (req, res) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await customerService.getBookingPayments(
      req.params.bookingNumber,
      req.user,
      paginationParams,
    );

    if (result.rows) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.rows,
          result.count,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response
      res.json(result);
    }
  } catch (e) {
    res.status(403).json({ message: e.message });
  }
};
