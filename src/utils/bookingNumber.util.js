exports.generateBookingNumber = () => {
  const timestamp = Date.now();
  return `BK-${timestamp}`;
};
