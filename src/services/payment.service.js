const bookingRepo = require("../repositories/booking.repository");
const paymentRepo = require("../repositories/payment.repository");

class PaymentService {
  async addPayment(payload, user) {
    const { booking_number, amount, payment_mode, proof_url } = payload;

    // ONLINE payment must have proof
    if (payment_mode === "ONLINE" && !proof_url) {
      throw new Error("Payment proof is required for online payments");
    }

    console.log("booking", booking_number);
    // 1️⃣ Get booking
    const booking = await bookingRepo.getByBookingNumber(booking_number);
    if (!booking) throw new Error("Booking not found");

    // 2️⃣ Booking must be payable
    if (booking.status === "CANCELLED") {
      throw new Error("Cannot accept payment for cancelled booking");
    }

    // 3️⃣ Get total paid so far
    const totalPaid = await paymentRepo.getTotalPaid(booking_number);
    const balance = Number(booking.final_amount) - Number(totalPaid);

    // 4️⃣ Validate amount
    if (amount <= 0) {
      throw new Error("Invalid payment amount");
    }
    if (amount > balance) {
      throw new Error("Payment exceeds remaining balance");
    }

    // 5️⃣ Resolve collector role
    const collectedByRole =
      user.role === "TECHNICIAN" ? "TECHNICIAN" : "RECEPTIONIST";

    // 6️⃣ Create payment ledger entry
    await paymentRepo.createPayment({
      booking_number,
      amount,
      payment_mode,
      proof_url: proof_url || null,
      collected_by_role: collectedByRole,
      collected_by_user_id: user.id,
      payment_date: new Date(),
    });

    // 7️⃣ Derived values (NOT STORED)
    const updatedTotalPaid = Number(totalPaid) + Number(amount);
    const updatedBalance = Number(booking.final_amount) - updatedTotalPaid;

    let payment_status = "PENDING";
    if (updatedTotalPaid > 0 && updatedBalance > 0) {
      payment_status = "PARTIAL";
    }
    if (updatedBalance === 0) {
      payment_status = "PAID";
    }

    return {
      booking_number,
      final_amount: booking.final_amount,
      total_paid: updatedTotalPaid,
      balance: updatedBalance,
      payment_status,
    };
  }

  async getPaymentSummary(bookingNumber) {
    const booking = await bookingRepo.getByBookingNumber(bookingNumber);
    if (!booking) throw new Error("Booking not found");

    const totalPaid = await paymentRepo.getTotalPaid(bookingNumber);
    const balance = Number(booking.final_amount) - Number(totalPaid);

    let payment_status = "PENDING";
    if (totalPaid > 0 && balance > 0) payment_status = "PARTIAL";
    if (balance === 0) payment_status = "PAID";

    return {
      booking_number: bookingNumber,
      final_amount: booking.final_amount,
      total_paid: totalPaid,
      balance,
      payment_status,
    };
  }

  // async getBookingPayments(pagination = null) {
  //   const bookings = await paymentRepo.getBookingPaymentSummary(pagination);

  //   let result = [];

  //   // Check if pagination is being used
  //   if (bookings.bookings) {
  //     // Pagination enabled - bookings is { bookings, total }
  //     for (const b of bookings.bookings) {
  //       const totalPaid = Number(b.total_paid || 0);
  //       const totalRefunded = Number(b.total_refunded || 0);
  //       const netPaid = totalPaid - totalRefunded;
  //       const balance = Number(b.final_amount) - netPaid;

  //       let payment_status = "PENDING";
  //       if (netPaid > 0 && balance > 0) payment_status = "PARTIAL";
  //       if (balance === 0) payment_status = "PAID";

  //       const payments = await paymentRepo.getPaymentsByBooking(
  //         b.booking_number,
  //       );

  //       result.push({
  //         booking_number: b.booking_number,
  //         final_amount: Number(b.final_amount),
  //         total_paid: totalPaid,
  //         total_refunded: totalRefunded,
  //         balance,
  //         payment_status,
  //         payments: Array.isArray(payments)
  //           ? payments
  //           : payments.payments || [],
  //       });
  //     }
  //     return { data: result, total: bookings.total };
  //   } else {
  //     // Legacy response - bookings is array
  //     for (const b of bookings) {
  //       const totalPaid = Number(b.total_paid || 0);
  //       const totalRefunded = Number(b.total_refunded || 0);
  //       const netPaid = totalPaid - totalRefunded;
  //       const balance = Number(b.final_amount) - netPaid;

  //       let payment_status = "PENDING";
  //       if (netPaid > 0 && balance > 0) payment_status = "PARTIAL";
  //       if (balance === 0) payment_status = "PAID";

  //       const payments = await paymentRepo.getPaymentsByBooking(
  //         b.booking_number,
  //       );

  //       result.push({
  //         booking_number: b.booking_number,
  //         final_amount: Number(b.final_amount),
  //         total_paid: totalPaid,
  //         total_refunded: totalRefunded,
  //         balance,
  //         payment_status,
  //         payments: Array.isArray(payments)
  //           ? payments
  //           : payments.payments || [],
  //       });
  //     }

  //     return result;
  //   }
  // }

  async getBookingPayments(pagination = null, user) {
    const bookings = await paymentRepo.getBookingPaymentSummary(
      pagination,
      user, // ✅ ONLY ADD THIS
    );

    let result = [];

    // ⛔ BELOW CODE UNCHANGED
    if (bookings.bookings) {
      for (const b of bookings.bookings) {
        const bookingData = b.get ? b.get({ plain: true }) : b;
        const totalPaid = Number(bookingData.total_paid || 0);
        const totalRefunded = Number(bookingData.total_refunded || 0);
        const netPaid = totalPaid - totalRefunded;
        const balance = Number(bookingData.final_amount) - netPaid;

        let payment_status = "PENDING";
        if (netPaid > 0 && balance > 0) payment_status = "PARTIAL";
        if (balance === 0) payment_status = "PAID";

        const payments = await paymentRepo.getPaymentsByBooking(
          b.booking_number,
        );

        result.push({
          booking_number: b.booking_number,
          final_amount: Number(b.final_amount),
          total_paid: totalPaid,
          total_refunded: totalRefunded,
          balance,
          payment_status,
          payments: Array.isArray(payments)
            ? payments
            : payments.payments || [],
        });
      }
      return { data: result, total: bookings.total };
    }

    for (const b of bookings) {
      const bookingData = b.get ? b.get({ plain: true }) : b;
      const totalPaid = Number(bookingData.total_paid || 0);
      const totalRefunded = Number(bookingData.total_refunded || 0);
      const netPaid = totalPaid - totalRefunded;
      const balance = Number(bookingData.final_amount) - netPaid;

      let payment_status = "PENDING";
      if (netPaid > 0 && balance > 0) payment_status = "PARTIAL";
      if (balance === 0) payment_status = "PAID";

      const payments = await paymentRepo.getPaymentsByBooking(b.booking_number);

      result.push({
        booking_number: b.booking_number,
        final_amount: Number(b.final_amount),
        total_paid: totalPaid,
        total_refunded: totalRefunded,
        balance,
        payment_status,
        payments: Array.isArray(payments) ? payments : payments.payments || [],
      });
    }

    return result;
  }
}

module.exports = new PaymentService();
