const dashboardService = require("../services/dashboard.service");

exports.getDashboard = async (req, res) => {
  try {
    const { branchId, period } = req.query;
    const data = await dashboardService.getDashboard(req.user, branchId, period);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBranchComparison = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const data = await dashboardService.getBranchComparison(limit, offset);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
