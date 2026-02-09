const paymentService = require("../services/payment.service");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

exports.createPayment = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const payload = {
      ...req.body,
      proof_url: req.file ? `uploads/payments/${req.file.filename}` : null,
    };

    const result = await paymentService.addPayment(payload, req.user);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getPaymentSummary = async (req, res) => {
  try {
    const result = await paymentService.getPaymentSummary(
      req.params.booking_number,
    );
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// exports.getBookingPayments = async (req, res) => {
//   try {
//     const paginationParams = getPaginationParams(req.query);
//     const result = await paymentService.getBookingPayments(paginationParams);

//     if (result.data) {
//       // Pagination enabled
//       res.json(
//         getPaginatedResponse(
//           result.data,
//           result.total,
//           paginationParams.page,
//           paginationParams.limit,
//         ),
//       );
//     } else {
//       // Legacy response
//       res.json(result);
//     }
//   } catch (e) {
//     res.status(500).json({ message: e.message });
//   }
// };

exports.getBookingPayments = async (req, res) => {
  try {
    const paginationParams = getPaginationParams(req.query);

    const result = await paymentService.getBookingPayments(
      { ...paginationParams, ...req.query },
      req.user, // ✅ ONLY ADD THIS
    );

    if (result.data) {
      res.json(
        getPaginatedResponse(
          result.data,
          result.total,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      res.json(result);
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
