const express = require("express");
const router = express.Router();

const auditLogController = require("../controllers/auditLog.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

router.use(auth, authorize(["SUPER_ADMIN"]));

router.get("/", auditLogController.getAuditLogs);

module.exports = router;
