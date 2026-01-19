const userRepository = require("../repositories/user.repository");

class UserService {
  async getUsersByRole({ roleName, user, pagination = null }) {
    if (!roleName) {
      throw new Error("Role is required");
    }

    const baseBranchId =
      user.role_id === 1 // SUPER_ADMIN role_id
        ? null
        : user.base_branch_id;

    return userRepository.findByRoleName(roleName, baseBranchId, pagination);
  }
}

module.exports = new UserService();
