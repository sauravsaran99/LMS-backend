const dashboardRepo = require("../repositories/dashboard.repository");

class DashboardService {
  async getDashboard(user) {
    const branchId = user.role === "SUPER_ADMIN" ? null : user.base_branch_id;

    const summary = await dashboardRepo.getSummary(branchId);
    const chart = await dashboardRepo.getChart(branchId);
    const recentBookings = await dashboardRepo.getRecentBookings(branchId);

    return {
      summary,
      chart,
      recent_bookings: recentBookings,
    };
  }
}

module.exports = new DashboardService();
