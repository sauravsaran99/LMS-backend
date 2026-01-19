const { Branch } = require("../models");
const { calculateOffset } = require("../utils/pagination.util");

class BranchRepository {
  async getAll(pagination = null) {
    const options = {
      where: { is_active: true },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Branch.count({ where: { is_active: true } });
      const branches = await Branch.findAll(options);
      return { branches, total };
    }

    return Branch.findAll(options);
  }

  create(data) {
    return Branch.create(data);
  }

  async findAll(pagination = null) {
    const options = {
      order: [["name", "ASC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Branch.count();
      const branches = await Branch.findAll(options);
      return { branches, total };
    }

    return Branch.findAll(options);
  }

  findById(id) {
    return Branch.findByPk(id);
  }

  findByName(name) {
    return Branch.findOne({ where: { name } });
  }

  update(id, data) {
    return Branch.update(data, { where: { id } });
  }
}

module.exports = new BranchRepository();
