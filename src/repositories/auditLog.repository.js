const { Op } = require("sequelize");
const { AuditLog, User, Branch } = require("../models");
const { calculateOffset } = require("../utils/pagination.util");

class AuditLogRepository {
  async findAll(filters, pagination = null) {
    const where = {};

    if (filters.from_date && filters.to_date) {
      where.created_at = {
        [Op.between]: [
          `${filters.from_date} 00:00:00`,
          `${filters.to_date} 23:59:59`,
        ],
      };
    }

    if (filters.entity) {
      where.entity = filters.entity;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    const options = {
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
        {
          model: Branch,
          attributes: ["id", "name"],
        },
      ],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await AuditLog.count({ where });
      const logs = await AuditLog.findAll(options);
      return { logs, total };
    }

    return AuditLog.findAll(options);
  }
}

module.exports = new AuditLogRepository();
