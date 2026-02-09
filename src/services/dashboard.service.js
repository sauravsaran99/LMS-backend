const dashboardRepo = require("../repositories/dashboard.repository");

class DashboardService {
  async getDashboard(user, queryBranchIdRaw, period) {
    const { branchId, branchId: queryBranchId } = this.resolveBranchId(user, queryBranchIdRaw);
    const { startDate, endDate } = this.getDateRange(period);

    const summary = await dashboardRepo.getSummary(branchId, startDate, endDate);
    const chart = await dashboardRepo.getChart(branchId, startDate, endDate);
    const recentBookings = await dashboardRepo.getRecentBookings(branchId, startDate, endDate);
    const paymentHealth = await dashboardRepo.getPaymentHealth(branchId, startDate, endDate);
    const bookingFunnel = await dashboardRepo.getBookingStatusFunnel(branchId, startDate, endDate);
    const topTests = await dashboardRepo.getTopTests(branchId, startDate, endDate);

    let technicianPerformance = [];

    if (user.role === "BRANCH_ADMIN" || user.role === "SUPER_ADMIN") {
      technicianPerformance = await dashboardRepo.getTechnicianPerformance(branchId, startDate, endDate);
    }

    return {
      summary,
      chart,
      recent_bookings: recentBookings,
      payment_health: paymentHealth,
      booking_funnel: bookingFunnel,
      top_tests: topTests,
      technician_performance: technicianPerformance
    };
  }

  resolveBranchId(user, queryBranchId) {
    let branchId = user.role === "SUPER_ADMIN" ? null : user.base_branch_id;
    if (user.role === "SUPER_ADMIN" && queryBranchId) {
      branchId = queryBranchId;
    }
    return { branchId, queryBranchId };
  }

  getDateRange(period) {
    if (!period || period === 'all_time') return { startDate: null, endDate: null };

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // Set endDate to end of today
    endDate.setHours(23, 59, 59, 999);

    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      // Set to start of current week (assuming Monday start)
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  }

  async getBranchComparison(limit, offset) {
    return await dashboardRepo.getBranchComparison({ limit, offset });
  }
}

module.exports = new DashboardService();
