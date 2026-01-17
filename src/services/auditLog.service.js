const auditLogRepo = require("../repositories/auditLog.repository");

class AuditLogService {
    getAuditLogs(filters) {
        return auditLogRepo.findAll(filters);
    }
}

module.exports = new AuditLogService();
