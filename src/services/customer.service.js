const {
  Customer,
  AuditLog,
  Booking,
  Payment,
  sequelize,
  Role,
  BookingTest,
  Test,
} = require("../models");
const BookingReport = require("../models/bookingReport.model");
const customerRepo = require("../repositories/customer.repository");
const userRepo = require("../repositories/user.repository");

class CustomerService {
  async createCustomer(payload, user) {
    const t = await sequelize.transaction();

    try {
      const existing = await customerRepo.findByPhone(payload.phone);
      if (existing) {
        throw new Error("Customer with this phone already exists");
      }

      let baseBranchId;
      if (user.role === "SUPER_ADMIN") {
        if (!payload.base_branch_id) {
          throw new Error("Branch is required for customer creation");
        }
        baseBranchId = payload.base_branch_id;
      } else {
        if (!user.base_branch_id) {
          throw new Error("User is not assigned to any branch");
        }
        baseBranchId = user.base_branch_id;
      }

      const customerRole = await Role.findOne({
        where: { name: "CUSTOMER" },
      });
      if (!customerRole) {
        throw new Error("CUSTOMER role not found");
      }

      const email = `${payload.phone}@lms.com`;
      const rawPassword = "Admin@123";

      const userRecord = await userRepo.create(
        {
          email,
          name: payload.name,
          password: rawPassword,
          role_id: customerRole.id,
          base_branch_id: baseBranchId,
          status: "ACTIVE",
        },
        t,
      );

      const customer = await customerRepo.create(
        {
          name: payload.name,
          phone: payload.phone,
          age: payload.age,
          gender: payload.gender,
          address: payload.address,
          base_branch_id: baseBranchId,
          user_id: userRecord.id,
        },
        t,
      );

      await t.commit();

      return {
        customer,
        credentials: {
          username: email,
          password: rawPassword,
        },
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async searchCustomers(query, pagination = null) {
    if (!query || query.length < 2) {
      return [];
    }
    return customerRepo.search(query, pagination);
  }

  getCustomers(user, pagination = null) {
    if (pagination) {
      return Customer.findAndCountAll({
        // where: { base_branch_id: user.base_branch_id },
        order: [["created_at", "DESC"]],
        limit: pagination.limit,
        offset: pagination.offset,
      });
    }
    return Customer.findAll({
      // where: { base_branch_id: user.base_branch_id },
      order: [["created_at", "DESC"]],
    });
  }

  async updateCustomer(id, payload, user) {
    const customer = await Customer.findByPk(id);

    if (!customer || customer.base_branch_id !== user.base_branch_id) {
      throw new Error("Unauthorized");
    }

    const oldData = customer.toJSON();

    await customer.update({
      name: payload.name,
      phone: payload.phone,
      address: payload.address,
    });

    await AuditLog.create({
      action: "UPDATE_CUSTOMER",
      action_type: "UPDATE",
      entity: "CUSTOMER",
      entity_id: customer.id,
      old_value: oldData,
      new_value: payload,
      user_id: user.id,
      role: user.role,
      branch_id: user.base_branch_id,
    });
  }

  async toggleStatus(id, user) {
    const customer = await Customer.findByPk(id);

    if (!customer || customer.base_branch_id !== user.base_branch_id) {
      throw new Error("Unauthorized");
    }

    const oldStatus = customer.status;
    const newStatus = oldStatus === "ACTIVE" ? false : true;

    await customer.update({ status: newStatus });

    await AuditLog.create({
      action: "CHANGE_CUSTOMER_STATUS",
      action_type: "STATUS_CHANGE",
      entity: "CUSTOMER",
      entity_id: customer.id,
      old_value: { status: oldStatus },
      new_value: { status: newStatus },
      user_id: user.id,
      role: user.role,
      branch_id: user.base_branch_id,
    });
  }

async getMyBookings(user, pagination = null) {
  const customer = await Customer.findOne({
    where: { user_id: user.id },
  });

  if (!customer) throw new Error("Customer profile not found");

  const options = {
    where: { customer_id: customer.id },
    order: [["created_at", "DESC"]],

    include: [
      {
        model: BookingTest,
        as: "bookingTests",
        attributes: [],        // ❗ do NOT select id
        required: false,
      },
    ],

    attributes: {
      include: [
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn(
              "DISTINCT",
              sequelize.col("bookingTests.id"),
            ),
          ),
          "tests_count",
        ],
      ],
    },

    group: ["Booking.id"],
    subQuery: false,
  };

  if (pagination) {
    options.limit = pagination.limit;
    options.offset = pagination.offset;
    return Booking.findAndCountAll(options);
  }

  return Booking.findAll(options);
}


  async getBookingTests(bookingId, user, pagination = null) {
    const customer = await Customer.findOne({
      where: { user_id: user.id },
    });

    if (!customer) throw new Error("Customer profile not found");

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        customer_id: customer.id,
      },
    });

    if (!booking) throw new Error("Unauthorized");

    const options = {
      where: { booking_id: booking.id },
      include: [{ model: Test, attributes: ["id", "name"] }],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
      const result = await BookingTest.findAndCountAll(options);
      return result;
    }

    return BookingTest.findAll(options);
  }

  async getBookingPayments(bookingNumber, user, pagination = null) {
    const customer = await Customer.findOne({
      where: { user_id: user.id },
    });

    if (!customer) throw new Error("Customer profile not found");

    const booking = await Booking.findOne({
      where: {
        booking_number: bookingNumber,
        customer_id: customer.id,
      },
    });

    if (!booking) throw new Error("Unauthorized");

    const options = {
      where: { booking_number: bookingNumber },
      order: [["payment_date", "ASC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
      const result = await Payment.findAndCountAll(options);
      return result;
    }

    return Payment.findAll(options);
  }

  async getBookingReports(bookingId, user, pagination = null) {
    const customer = await Customer.findOne({
      where: { user_id: user.id },
    });

    if (!customer) {
      throw new Error("Customer profile not found");
    }

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        customer_id: customer.id,
      },
    });

    if (!booking) {
      throw new Error("Unauthorized");
    }

    const options = {
      where: { booking_id: booking.id },
      order: [["created_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
      const result = await BookingReport.findAndCountAll(options);
      return result;
    }

    return BookingReport.findAll(options);
  }
}

module.exports = new CustomerService();
