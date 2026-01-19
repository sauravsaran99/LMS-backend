const { sequelize } = require("../models");

class DashboardRepository {
  async getSummary(branchId) {
    const [rows] = await sequelize.query(
      `
      SELECT
        COUNT(b.id) AS total_bookings,
        SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_bookings,
        COALESCE(SUM(p.total_paid), 0) AS total_paid,
        COALESCE(SUM(b.discount_amount), 0) AS discount_given,
        (
          COALESCE(SUM(p.total_paid), 0)
          - COALESCE(SUM(b.discount_amount), 0)
        ) AS net_revenue,
        SUM(
          CASE
            WHEN p.total_paid IS NULL OR p.total_paid < b.final_amount
            THEN 1 ELSE 0
          END
        ) AS pending_payments
      FROM bookings b
      LEFT JOIN (
        SELECT booking_number, SUM(amount) AS total_paid
        FROM payments
        GROUP BY booking_number
      ) p ON p.booking_number = b.booking_number
      ${branchId ? "WHERE b.branch_id = :branchId" : ""}
      `,
      {
        replacements: branchId ? { branchId } : {},
      },
    );

    return rows[0];
  }

  async getChart(branchId) {
    const [rows] = await sequelize.query(
      `
      SELECT
        DATE(b.created_at) AS date,
        COUNT(b.id) AS bookings,
        COALESCE(SUM(p.total_paid), 0) AS revenue
      FROM bookings b
      LEFT JOIN (
        SELECT booking_number, SUM(amount) AS total_paid
        FROM payments
        GROUP BY booking_number
      ) p ON p.booking_number = b.booking_number
      ${branchId ? "WHERE b.branch_id = :branchId" : ""}
      GROUP BY DATE(b.created_at)
      ORDER BY DATE(b.created_at) ASC
      `,
      {
        replacements: branchId ? { branchId } : {},
      },
    );

    return {
      dates: rows.map((r) => r.date),
      bookings: rows.map((r) => Number(r.bookings)),
      revenue: rows.map((r) => Number(r.revenue)),
    };
  }

  async getRecentBookings(branchId) {
    const [rows] = await sequelize.query(
      `
      SELECT
        b.booking_number,
        b.status,
        b.final_amount,
        c.name AS customer_name,
        GROUP_CONCAT(t.name SEPARATOR ', ') AS tests
      FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      JOIN booking_tests bt ON bt.booking_id = b.id
      JOIN tests t ON t.id = bt.test_id
      ${branchId ? "WHERE b.branch_id = :branchId" : ""}
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT 5
      `,
      {
        replacements: branchId ? { branchId } : {},
      },
    );

    return rows;
  }
}

module.exports = new DashboardRepository();
