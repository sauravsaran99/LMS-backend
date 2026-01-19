const bookingService = require("../services/booking.service");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

exports.getBookings = async (req, res, next) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await bookingService.getTechnicianBookings(
      req.user,
      paginationParams,
    );

    if (result.bookings) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.bookings,
          result.total,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
};

exports.collectSample = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    await bookingService.collectSample({
      bookingId,
      user: req.user,
    });

    res.json({ message: "Sample collected successfully" });
  } catch (err) {
    next(err);
  }
};

exports.markCompleted = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    await bookingService.markCompleted({
      bookingId,
      user: req.user,
    });

    res.json({ message: "Booking marked as completed" });
  } catch (err) {
    next(err);
  }
};

exports.getCompletedBookings = async (req, res, next) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await bookingService.getCompletedBookingsForTechnician(
      req.user,
      paginationParams,
    );

    if (result.bookings) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.bookings,
          result.total,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
};
