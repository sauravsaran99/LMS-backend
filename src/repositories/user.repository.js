const { User, Role, UserBranch, Branch } = require("../models");
const { calculateOffset } = require("../utils/pagination.util");
const { Op } = require("sequelize");

class UserRepository {
  async findByRoleName(roleName, baseBranchId = null, pagination = null) {
    const include = [
      {
        model: Role,
        where: { name: roleName },
        attributes: [],
      },
      {
        model: Branch,
        attributes: ["name"],
      },
    ];

    const where = {};

    if (baseBranchId !== null) {
      if (roleName === "TECHNICIAN") {
        // specific logic for technician: check base_branch_id OR user_branch table
        include.push({
          model: UserBranch,
          required: false, // LEFT JOIN
          attributes: [],
        });

        where[Op.or] = [
          { base_branch_id: baseBranchId },
          { "$UserBranches.branch_id$": baseBranchId },
        ];
      } else {
        // default behavior for other roles
        where.base_branch_id = baseBranchId;
      }
    }

    const options = {
      where,
      include,
      attributes: ["id", "name", "email", "base_branch_id"],
      order: [["name", "ASC"]],
      subQuery: false, // Essential for complex where clauses in includes or top level with limits
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const countOptions = {
        where,
        include: include.filter((i) => i.model !== Branch && i.model !== UserBranch), // Optimize count query if possible, or keep same includes minus attributes
        distinct: true,
      };

      // Re-add UserBranch if needed for the where clause
      if (baseBranchId !== null && roleName === "TECHNICIAN") {
        countOptions.include.push({
          model: UserBranch,
          required: false,
          attributes: [],
        });
      }

      // Actually, for safety and correctness with complex where/includes, often best to just run count() with same main structure
      // But let's simplify:

      const total = await User.count({
        where,
        include: include, // Use the same include structure to ensure filtering is correct
        distinct: true,
      });

      const users = await User.findAll(options);
      return { users, total };
    }

    return User.findAll(options);
  }

  async getTechnicianBranchIds(userId) {
    const rows = await UserBranch.findAll({
      where: { user_id: userId },
      attributes: ["branch_id"],
      raw: true,
    });

    return rows.map((r) => r.branch_id);
  }

  findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  create(data, transaction) {
    return User.create(data, { transaction });
  }
}

module.exports = new UserRepository();
