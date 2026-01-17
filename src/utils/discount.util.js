/**
 * Calculate discount for a given amount
 * @param {number} amount - original amount
 * @param {string} type - FLAT | PERCENTAGE
 * @param {number} value - discount value
 */
exports.calculateDiscount = ({ amount, type, value }) => {
  let discountAmount = 0;

  if (type === 'FLAT') {
    discountAmount = value;
  }

  if (type === 'PERCENTAGE') {
    discountAmount = (amount * value) / 100;
  }

  if (discountAmount > amount) {
    discountAmount = amount;
  }

  return {
    original_amount: amount,
    discount_type: type,
    discount_value: value,
    discount_amount: Number(discountAmount.toFixed(2)),
    final_amount: Number((amount - discountAmount).toFixed(2))
  };
};
