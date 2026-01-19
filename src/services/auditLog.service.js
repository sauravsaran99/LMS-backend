const auditLogRepo = require("../repositories/auditLog.repository");

class AuditLogService {
  getAuditLogs(filters, pagination = null) {
    return auditLogRepo.findAll(filters, pagination);
  }
}

module.exports = new AuditLogService();
