const auditLogService = require("../services/auditLog.service");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

exports.getAuditLogs = async (req, res) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await auditLogService.getAuditLogs(
      req.query,
      paginationParams,
    );

    let responseData;
    if (Array.isArray(result)) {
      // Legacy response without pagination
      responseData = result.map((log) => ({
        id: log.id,
        action: log.action,
        action_type: log.action_type,
        entity: log.entity,
        entity_id: log.entity_id,
        old_value: log.old_value,
        new_value: log.new_value,
        role: log.role,
        created_at: log.created_at,
        user_id: log.user_id,
        user_name: log.User?.name || null,
        branch_id: log.branch_id,
        branch_name: log.Branch?.name || null,
      }));
      res.json(responseData);
    } else if (result.logs) {
      // Pagination enabled
      const formattedLogs = result.logs.map((log) => ({
        id: log.id,
        action: log.action,
        action_type: log.action_type,
        entity: log.entity,
        entity_id: log.entity_id,
        old_value: log.old_value,
        new_value: log.new_value,
        role: log.role,
        created_at: log.created_at,
        user_id: log.user_id,
        user_name: log.User?.name || null,
        branch_id: log.branch_id,
        branch_name: log.Branch?.name || null,
      }));
      res.json(
        getPaginatedResponse(
          formattedLogs,
          result.total,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};
