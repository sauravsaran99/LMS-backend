const { User, Role, UserBranch, Branch } = require("../models");
const { calculateOffset } = require("../utils/pagination.util");

class UserRepository {
  // async findByRoleName(roleName, baseBranchId = null, pagination = null) {
  //   const where = {};

  //   if (baseBranchId !== null) {
  //     where.base_branch_id = baseBranchId;
  //   }

  //   const options = {
  //     where,
  //     include: [
  //       {
  //         model: Role,
  //         where: { name: roleName }, // ✅ CORRECT WAY
  //         attributes: [],
  //       },
  //     ],
  //     attributes: ["id", "name", "email"],
  //     order: [["name", "ASC"]],
  //   };

  //   if (pagination) {
  //     options.limit = pagination.limit;
  //     options.offset = pagination.offset;
  //   }

  //   if (pagination) {
  //     const total = await User.count({
  //       where,
  //       include: [
  //         {
  //           model: Role,
  //           where: { name: roleName },
  //           attributes: [],
  //         },
  //       ],
  //     });
  //     const users = await User.findAll(options);
  //     return { users, total };
  //   }

  //   return User.findAll(options);
  // }

  async findByRoleName(roleName, baseBranchId = null, pagination = null) {
    const where = {};

    if (baseBranchId !== null) {
      where.base_branch_id = baseBranchId;
    }

    const options = {
      where,
      include: [
        {
          model: Role,
          where: { name: roleName },
          attributes: [],
        },
        {
          model: Branch,
          attributes: ["name"], // 👈 branch name
        },
      ],
      attributes: ["id", "name", "email", "base_branch_id"],
      order: [["name", "ASC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await User.count({
        where,
        include: [
          {
            model: Role,
            where: { name: roleName },
            attributes: [],
          },
          {
            model: Branch,
          },
        ],
        distinct: true, // 👈 IMPORTANT when joins exist
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
