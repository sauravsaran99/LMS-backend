const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, dashboardController.getDashboard);
router.get("/branch-comparison", auth, dashboardController.getBranchComparison);

module.exports = router;
