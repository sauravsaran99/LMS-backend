const { Op } = require("sequelize");
const { Customer } = require("../models");

class CustomerRepository {
  async findByPhone(phone) {
    return Customer.findOne({ where: { phone } });
  }

  async create(data) {
    return Customer.create(data);
  }

  async search(query) {
    return Customer.findAll({
      where: {
        [Op.or]: [
          {
            phone: {
              [Op.like]: `%${query}%`,
            },
          },
          {
            name: {
              [Op.like]: `%${query}%`,
            },
          },
        ],
      },
      limit: 20,
      order: [["created_at", "DESC"]],
    });
  }

  create(data, transaction) {
    return Customer.create(data, { transaction });
  }
}

module.exports = new CustomerRepository();
