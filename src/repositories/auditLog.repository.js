const { Op } = require("sequelize");
const { AuditLog, User, Branch } = require("../models");

class AuditLogRepository {
    async findAll(filters) {
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

        return AuditLog.findAll({
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
        });
    }
}

module.exports = new AuditLogRepository();
