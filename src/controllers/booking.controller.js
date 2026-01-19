const bookingService = require("../services/booking.service");
const { createBookingSchema } = require("../validators/booking.validator");

exports.createBooking = async (req, res) => {
  try {
    const { error, value } = createBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const booking = await bookingService.createBooking(value, req.user);

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.assignTechnician = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { technician_id } = req.body;

    if (!technician_id) {
      return res.status(400).json({ message: "Technician is required" });
    }

    await bookingService.assignTechnician({
      bookingId,
      technicianId: technician_id,
      user: req.user,
    });

    res.json({ message: "Technician assigned successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const bookings = await bookingService.getBookingsByStatus({
      status,
      user: req.user,
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.uploadTestReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Report file is required" });
    }

    const report = await bookingService.uploadTestReport(
      req.params.id,
      req.file.path,
      req.user,
    );

    res.json({
      message: "Report uploaded successfully",
      report,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
