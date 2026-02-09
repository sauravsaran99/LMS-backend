const { Op } = require("sequelize");
const { Customer } = require("../models");
const { calculateOffset } = require("../utils/pagination.util");

class CustomerRepository {
  async findByPhone(phone) {
    return Customer.findOne({ where: { phone } });
  }

  async findByNameAndPhone(name, phone) {
    const user = await Customer.findOne({
      where: {
        name,
        phone,
      },
    });

    return user;
  }


  async create(data) {
    const dataUser = await Customer.create(data);

    console.log('dataUser', dataUser)

    return dataUser;
  }

  async search(query, pagination = null) {
    const whereConditions = [
      {
        [Op.or]: [
          { phone: { [Op.like]: `%${query}%` } },
          { name: { [Op.like]: `%${query}%` } },
        ],
      },
    ];

    if (pagination?.createdBy) {
      whereConditions.push({ created_by: pagination.createdBy });
    }
    if (pagination?.baseBranchId) {
      whereConditions.push({ base_branch_id: pagination.baseBranchId });
    }

    const where = { [Op.and]: whereConditions };

    const options = {
      where,
      order: [["created_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    } else {
      options.limit = 20;
    }

    if (pagination) {
      const total = await Customer.count({ where });
      const rows = await Customer.findAll(options);
      return { rows, count: total };
    }

    return Customer.findAll(options);
  }

  async findAll(pagination = null) {
    const where = {};
    if (pagination?.createdBy) where.created_by = pagination.createdBy;
    if (pagination?.baseBranchId) where.base_branch_id = pagination.baseBranchId;

    const options = {
      where,
      order: [["created_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
      const count = await Customer.count({ where: options.where });
      const rows = await Customer.findAll(options);
      return { rows, count };
    }

    return Customer.findAll(options);
  }
}

module.exports = new CustomerRepository();
