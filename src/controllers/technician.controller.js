const bookingService = require("../services/booking.service");

exports.getBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.getTechnicianBookings(req.user);
        res.json(bookings);
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
        const bookings =
            await bookingService.getCompletedBookingsForTechnician(
                req.user
            );

        res.json(bookings);
    } catch (err) {
        next(err);
    }
};



