const { User, Role } = require("../models");

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
}

module.exports = new UserRepository();
