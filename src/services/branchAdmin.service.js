const { User, AuditLog, Role, sequelize } = require("../models");
const userRepository = require("../repositories/user.repository");

class BranchAdminService {
  async getUsers(admin, pagination = null) {
    const { UserBranch } = require("../models");
    const { Op } = require("sequelize");

    // users based in this branch OR assigned to this branch via UserBranch
    const where = {
      [Op.or]: [
        { base_branch_id: admin.base_branch_id },
        { "$UserBranches.branch_id$": admin.base_branch_id },
      ],
    };

    const options = {
      where,
      include: [
        {
          model: Role,
          attributes: ["name"],
          where: {
            name: ["RECEPTIONIST", "TECHNICIAN"],
          },
        },
        {
          model: UserBranch,
          attributes: ["branch_id"],
          required: false,
        },
      ],
      subQuery: false,
      order: [["name", "ASC"]],
    };

    if (pagination) {
      const total = await User.count({
        include: [
          {
            model: Role,
            where: { name: ["RECEPTIONIST", "TECHNICIAN"] },
          },
          {
            model: UserBranch,
            required: false,
          },
        ],
        where,
        distinct: true,
      });

      options.limit = pagination.limit;
      options.offset = pagination.offset;
      const users = await User.findAll(options);
      return { users, total };
    }

    return User.findAll(options);
  }

  async createUser(payload, admin) {
    if (!["RECEPTIONIST", "TECHNICIAN"].includes(payload.role)) {
      throw new Error("Invalid role");
    }

    // 1️⃣ Resolve role_id from role name
    const role = await Role.findOne({
      where: { name: payload.role },
    });

    if (!role) {
      throw new Error("Role not found");
    }

    const t = await sequelize.transaction();

    try {
      // 2️⃣ Create user with role_id
      const user = await User.create(
        {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role_id: role.id,
          base_branch_id: admin.base_branch_id,
          status: "ACTIVE",
        },
        { transaction: t }
      );

      // 2.5️⃣ Assign to branches if provided
      if (payload.branchIds && Array.isArray(payload.branchIds)) {
        const uniqueBranchIds = [...new Set(payload.branchIds)];

        if (!uniqueBranchIds.includes(admin.base_branch_id)) {
          uniqueBranchIds.push(admin.base_branch_id);
        }

        const userBranches = uniqueBranchIds.map((branchId) => ({
          user_id: user.id,
          branch_id: branchId,
        }));

        const { UserBranch } = require("../models");
        await UserBranch.bulkCreate(userBranches, { transaction: t });
      }

      await AuditLog.create(
        {
          action: "CREATE_USER",
          action_type: "CREATE",
          entity: "USER",
          entity_id: user.id,
          new_value: {
            name: user.name,
            email: user.email,
            role: payload.role,
            branches: payload.branchIds,
          },
          user_id: admin.id,
          role: admin.role,
          branch_id: admin.base_branch_id,
        },
        { transaction: t }
      );

      await t.commit();
      return user;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  async updateUser(userId, payload, admin) {
    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId);

      if (!user) throw new Error("User not found");

      // Update basic fields
      if (payload.name) user.name = payload.name;
      if (payload.email) user.email = payload.email;
      if (payload.password) user.password = payload.password; // Model hook will hash it

      // Update UserBranch
      if (payload.branchIds && Array.isArray(payload.branchIds)) {
        const { UserBranch } = require("../models");

        // Remove old associations
        await UserBranch.destroy({
          where: { user_id: user.id },
          transaction: t,
        });

        // Add new associations
        const uniqueBranchIds = [...new Set(payload.branchIds)];
        if (!uniqueBranchIds.includes(user.base_branch_id)) {
          uniqueBranchIds.push(user.base_branch_id);
        }

        const userBranches = uniqueBranchIds.map((branchId) => ({
          user_id: user.id,
          branch_id: branchId,
        }));

        await UserBranch.bulkCreate(userBranches, { transaction: t });
      }

      await user.save({ transaction: t });

      await AuditLog.create(
        {
          action: "UPDATE_USER",
          action_type: "UPDATE",
          entity: "USER",
          entity_id: user.id,
          new_value: payload,
          user_id: admin.id,
          role: admin.role,
          branch_id: admin.base_branch_id,
        },
        { transaction: t }
      );

      await t.commit();
      return user;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  async toggleUserStatus(userId, admin) {
    const user = await User.findByPk(userId);

    if (!user || user.base_branch_id !== admin.base_branch_id) {
      throw new Error("Unauthorized");
    }

    const oldStatus = user.is_active;
    user.is_active = user.is_active == 1 ? 0 : 1;
    await user.save();

    await AuditLog.create({
      action: "UPDATE_USER_STATUS",
      action_type: "UPDATE",
      entity: "USER",
      entity_id: user.id,
      old_value: { status: oldStatus },
      new_value: { status: user.status },
      user_id: admin.id,
      role: admin.role,
      branch_id: admin.base_branch_id,
    });
  }

  async createBranchAdmin(payload, user) {
    const t = await sequelize.transaction();

    try {
      const { name, email, password, base_branch_id } = payload;

      if (!base_branch_id) {
        throw new Error("Branch is required");
      }

      const branchAdminRole = await Role.findOne({
        where: { name: "BRANCH_ADMIN" },
      });

      if (!branchAdminRole) {
        throw new Error("BRANCH_ADMIN role not found");
      }

      const admin = await userRepository.create(
        {
          name,
          email,
          password,
          role_id: branchAdminRole.id,
          base_branch_id,
          status: "ACTIVE",
        },
        t,
      );

      await t.commit();
      return admin;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  async getBranchAdmins(pagination = null) {
    return userRepository.findByRoleName(
      "BRANCH_ADMIN",
      null, // ❗ Super admin sees all branch admins
      pagination,
    );
  }

  async createBranchAdmin(payload) {
    const { name, email, password, base_branch_id } = payload;

    if (!base_branch_id) {
      throw new Error("Branch is required");
    }

    const branchAdminRole = await Role.findOne({
      where: { name: "BRANCH_ADMIN" },
    });

    if (!branchAdminRole) {
      throw new Error("BRANCH_ADMIN role not found");
    }

    return userRepository.create({
      name,
      email,
      password,
      role_id: branchAdminRole.id,
      base_branch_id,
      status: "ACTIVE",
    });
  }
}

module.exports = new BranchAdminService();
