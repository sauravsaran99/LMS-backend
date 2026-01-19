const { User, Role, UserBranch } = require("../models");

class UserRepository {
  async findByRoleName(roleName, baseBranchId = null) {
    const where = {};

    if (baseBranchId !== null) {
      where.base_branch_id = baseBranchId;
    }

    return User.findAll({
      where,
      include: [
        {
          model: Role,
          where: { name: roleName }, // ✅ CORRECT WAY
          attributes: [],
        },
      ],
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
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
