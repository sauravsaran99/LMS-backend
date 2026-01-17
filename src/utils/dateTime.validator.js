const isPastBooking = (scheduledDate, scheduledTime) => {
    // Normalize today's date (00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Normalize booking date (00:00)
    const bookingDate = new Date(scheduledDate);
    bookingDate.setHours(0, 0, 0, 0);

    // 1️⃣ If booking date is before today → INVALID
    if (bookingDate < today) {
        return true;
    }

    // 2️⃣ If booking date is today → check time
    if (bookingDate.getTime() === today.getTime()) {
        const now = new Date();

        const [startTime] = scheduledTime.split("-"); // "09:00"
        const [hours, minutes] = startTime.split(":").map(Number);

        const bookingDateTime = new Date();
        bookingDateTime.setHours(hours, minutes, 0, 0);

        if (bookingDateTime <= now) {
            return true;
        }
    }

    return false;
};

module.exports = { isPastBooking };
