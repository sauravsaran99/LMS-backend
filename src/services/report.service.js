const reportRepo = require('../repositories/report.repository');

class ReportService {
    async getSummaryReport(fromDate, toDate, branchId) {
        if (!branchId) {
            return reportRepo.getSummaryReport(fromDate, toDate);
        }

        return reportRepo.getSummaryReport(fromDate, toDate, branchId);
    }

    async getBranchWiseMonthly(user, fromDate, toDate) {
        // SUPER_ADMIN → all branches
        // RECEPTIONIST → only own branch

        if (user.role !== 'SUPER_ADMIN') {
            return reportRepo.getBranchWiseMonthly({
                fromDate,
                toDate,
                branchId: user.base_branch_id
            });
        }

        return reportRepo.getBranchWiseMonthly({ fromDate, toDate });
    }

    async getTechnicianWiseMonthly(user, fromDate, toDate) {
        return reportRepo.getTechnicianWiseMonthly({
            fromDate,
            toDate,
            branchId: user.role === 'SUPER_ADMIN' ? null : user.base_branch_id
        });
    }

    async getTestWiseMonthly(user, fromDate, toDate) {
        return reportRepo.getTestWiseMonthly({
            fromDate,
            toDate,
            branchId: user.role === 'SUPER_ADMIN' ? null : user.base_branch_id
        });
    }



}

module.exports = new ReportService();
