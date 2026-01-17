exports.validateDiscount = ({ type, value }) => {
  if (!type || !value) return false;

  if (!['FLAT', 'PERCENTAGE'].includes(type)) return false;

  if (value <= 0) return false;

  if (type === 'PERCENTAGE' && value > 100) return false;

  return true;
};
