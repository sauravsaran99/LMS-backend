const { User, AuditLog, Role } = require("../models");

class BranchAdminService {
  async getUsers(admin, pagination = null) {
    const options = {
      where: {
        base_branch_id: admin.base_branch_id,
      },
      include: [
        {
          model: Role,
          attributes: ["name"],
          where: {
            name: ["RECEPTIONIST", "TECHNICIAN"],
          },
        },
      ],
      order: [["name", "ASC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await User.count({
        where: {
          base_branch_id: admin.base_branch_id,
        },
        include: [
          {
            model: Role,
            attributes: ["name"],
            where: {
              name: ["RECEPTIONIST", "TECHNICIAN"],
            },
          },
        ],
      });
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

    console.log("role", role);

    if (!role) {
      throw new Error("Role not found");
    }

    // 2️⃣ Create user with role_id
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role_id: role.id,
      base_branch_id: admin.base_branch_id,
      status: "ACTIVE",
    });

    // 3️⃣ Audit log
    await AuditLog.create({
      action: "CREATE_USER",
      action_type: "CREATE",
      entity: "USER",
      entity_id: user.id,
      new_value: {
        name: user.name,
        email: user.email,
        role: payload.role,
      },
      user_id: admin.id,
      role: admin.role,
      branch_id: admin.base_branch_id,
    });

    return user;
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
}

module.exports = new BranchAdminService();
