const { Op, fn, col, literal } = require("sequelize");
const {
  Booking,
  BookingTest,
  Test,
  Customer,
  AuditLog,
  User,
} = require("../models");
const { calculateOffset } = require("../utils/pagination.util");

class BookingRepository {
  async getCustomerById(id) {
    return Customer.findByPk(id);
  }

  async getTestsByIds(ids) {
    return Test.findAll({
      where: { id: ids, is_active: true },
    });
  }

  async createBooking(data, transaction) {
    return Booking.create(data, { transaction });
  }

  async createBookingTests(bookingId, tests, transaction) {
    for (const test of tests) {
      await BookingTest.create(
        {
          booking_id: bookingId,
          test_id: test.id,
          price_snapshot: test.price,
        },
        { transaction },
      );
    }
  }

  async createAuditLog(data, transaction) {
    return AuditLog.create(data, { transaction });
  }

  async findById(id, options = {}) {
    return Booking.findByPk(id, options);
  }

  async findByBookingNumber(bookingNumber, options = {}) {
    if (!bookingNumber) {
      throw new Error("booking_number is required");
    }

    return Booking.findOne({
      where: { booking_number: bookingNumber },
      ...options,
    });
  }

  async updateTechnicianAndStatus(
    bookingId,
    technicianId,
    status,
    transaction,
  ) {
    return Booking.update(
      {
        technician_id: technicianId,
        status,
      },
      {
        where: { id: bookingId },
        transaction,
      },
    );
  }

  async findByStatus(where, pagination = null) {
    const options = {
      where,
      include: [
        { model: Customer, attributes: ["id", "name"] },
        { model: User, as: "technician", attributes: ["id", "name"] },
      ],
      order: [["created_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Booking.count({ where });
      const bookings = await Booking.findAll(options);
      return { bookings, total };
    }

    return Booking.findAll(options);
  }

  async findAll(whereClause, pagination = null) {
    const options = {
      where: whereClause, // ✅ ALWAYS OBJECT
      include: [
        { model: Customer, attributes: ["id", "name", "phone"] },
        { model: User, as: "technician", attributes: ["id", "name"] },
      ],
      order: [["created_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Booking.count({ where: whereClause });
      const bookings = await Booking.findAll(options);
      return { bookings, total };
    }

    return Booking.findAll(options);
  }

  async findForTechnician(technicianId, pagination = null) {
    const options = {
      where: {
        technician_id: technicianId,
        status: {
          [Op.in]: ["TECH_ASSIGNED", "SAMPLE_COLLECTED"],
        },
      },
      include: [
        {
          model: Customer,
          attributes: ["id", "name"],
        },
      ],
      attributes: {
        include: [
          // total_paid
          [
            literal(`(
            SELECT COALESCE(SUM(p.amount), 0)
            FROM payments p
            WHERE p.booking_number = Booking.booking_number
          )`),
            "total_paid",
          ],

          // total_refunded
          [
            literal(`(
            SELECT COALESCE(SUM(r.amount), 0)
            FROM refunds r
            WHERE r.booking_number = Booking.booking_number
          )`),
            "total_refunded",
          ],

          // pending_amount
          [
            literal(`(
            Booking.final_amount
            - (
              SELECT COALESCE(SUM(p.amount), 0)
              FROM payments p
              WHERE p.booking_number = Booking.booking_number
            )
            + (
              SELECT COALESCE(SUM(r.amount), 0)
              FROM refunds r
              WHERE r.booking_number = Booking.booking_number
            )
          )`),
            "pending_amount",
          ],
        ],
      },
      order: [["scheduled_date", "ASC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Booking.count({
        where: {
          technician_id: technicianId,
          status: { [Op.in]: ["TECH_ASSIGNED", "SAMPLE_COLLECTED"] },
        },
      });
      const bookings = await Booking.findAll(options);
      return { bookings, total };
    }

    return Booking.findAll(options);
  }

  async getTechnicianBookings(user, pagination = null) {
    if (user.role !== "TECHNICIAN") {
      throw new Error("Invalid role");
    }

    const options = {
      where: {
        technician_id: user.id,
        status: ["TECH_ASSIGNED", "SAMPLE_COLLECTED", "COMPLETED"],
      },
      order: [["created_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Booking.count({
        where: {
          technician_id: user.id,
          status: ["TECH_ASSIGNED", "SAMPLE_COLLECTED", "COMPLETED"],
        },
      });
      const bookings = await Booking.findAll(options);
      return { bookings, total };
    }

    return Booking.findAll(options);
  }

  async updateStatus(bookingId, status, transaction) {
    return Booking.update(
      { status },
      { where: { id: bookingId }, transaction },
    );
  }

  async findCompletedForTechnician(technicianId, pagination = null) {
    const options = {
      where: {
        technician_id: technicianId,
        status: "COMPLETED",
      },
      include: [{ model: Customer, attributes: ["id", "name"] }],
      order: [["updated_at", "DESC"]],
    };

    if (pagination) {
      options.limit = pagination.limit;
      options.offset = pagination.offset;
    }

    if (pagination) {
      const total = await Booking.count({
        where: {
          technician_id: technicianId,
          status: "COMPLETED",
        },
      });
      const bookings = await Booking.findAll(options);
      return { bookings, total };
    }

    return Booking.findAll(options);
  }

  async getByBookingNumber(bookingNumber) {
    return Booking.findOne({
      where: { booking_number: bookingNumber },
    });
  }
}

module.exports = new BookingRepository();
