const { Op } = require("sequelize");
const { Customer } = require("../models");
const { calculateOffset } = require("../utils/pagination.util");

class CustomerRepository {
  async findByPhone(phone) {
    return Customer.findOne({ where: { phone } });
  }

  async create(data) {
    return Customer.create(data);
  }

  async search(query, pagination = null) {
    const options = {
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
      order: [["created_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    } else {
      options.limit = 20;
    }

    if (pagination) {
      const total = await Customer.count({
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
      });
      const customers = await Customer.findAll(options);
      return { customers, total };
    }

    return Customer.findAll(options);
  }

  async findAll(pagination = null) {
    const options = {
      order: [["created_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Customer.count();
      const customers = await Customer.findAll(options);
      return { customers, total };
    }

    return Customer.findAll(options);
  }
}

module.exports = new CustomerRepository();
