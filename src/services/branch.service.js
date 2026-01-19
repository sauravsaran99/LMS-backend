const branchRepo = require("../repositories/branch.repository");

class BranchService {
  async listBranches(pagination = null) {
    return branchRepo.getAll(pagination);
  }

  async createBranch(payload) {
    const exists = await branchRepo.findByName(payload.name);
    if (exists) {
      throw new Error("Branch with this name already exists");
    }

    return branchRepo.create({
      name: payload.name,
      city: payload.city,
      status: true,
    });
  }

  getAllBranches(pagination = null) {
    return branchRepo.findAll(pagination);
  }

  async updateBranch(id, payload) {
    const branch = await branchRepo.findById(id);

    if (!branch) {
      throw new Error("Branch not found");
    }

    return branchRepo.update(id, payload);
  }

  async toggleStatus(id, status) {
    const branch = await branchRepo.findById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }
    console.log("status", status);

    const numericStatus = status === "ACTIVE" ? true : false;

    return branchRepo.update(id, { is_active: numericStatus });
  }
}

module.exports = new BranchService();
