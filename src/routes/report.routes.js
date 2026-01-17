const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.get(
    '/summary',
    auth,
    authorize(['SUPER_ADMIN', "BRANCH_ADMIN", 'RECEPTIONIST']),
    reportController.getSummaryReport
);

router.get(
    '/export/csv',
    auth,
    authorize(['SUPER_ADMIN', "BRANCH_ADMIN", 'RECEPTIONIST']),
    reportController.exportSummaryCSV
);

router.get(
    '/export/excel',
    auth,
    authorize(['SUPER_ADMIN', "BRANCH_ADMIN", 'RECEPTIONIST']),
    reportController.exportSummaryExcel
);

router.get(
    '/monthly-breakdown/branch',
    auth,
    authorize(['SUPER_ADMIN', "BRANCH_ADMIN", 'RECEPTIONIST']),
    reportController.getBranchWiseMonthly
);

router.get(
    '/monthly-breakdown/technician',
    auth,
    authorize(['SUPER_ADMIN', "BRANCH_ADMIN", 'RECEPTIONIST']),
    reportController.getTechnicianWiseMonthly
);

router.get(
    '/monthly-breakdown/test',
    auth,
    authorize(['SUPER_ADMIN', "BRANCH_ADMIN", 'RECEPTIONIST']),
    reportController.getTestWiseMonthly
);






module.exports = router;
