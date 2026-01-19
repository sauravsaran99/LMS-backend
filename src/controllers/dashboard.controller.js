const dashboardService = require("../services/dashboard.service");

exports.getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboard(req.user);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
