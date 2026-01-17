const { calculateDiscount } = require('../utils/discount.util');
const { validateDiscount } = require('../utils/discount.validator');

exports.previewDiscount = (req, res) => {
  const { amount, discount_type, discount_value } = req.body;

  if (!validateDiscount({ type: discount_type, value: discount_value })) {
    return res.status(400).json({ message: 'Invalid discount' });
  }

  const result = calculateDiscount({
    amount,
    type: discount_type,
    value: discount_value
  });

  res.json(result);
};
