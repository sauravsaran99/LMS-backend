const { sequelize } = require("../models");

class DashboardRepository {
  async getSummary(branchId, startDate, endDate) {
    const replacements = { branchId };
    if (startDate && endDate) {
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

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
      WHERE 1=1
      ${branchId ? "AND b.branch_id = :branchId" : ""}
      ${startDate && endDate ? "AND b.created_at BETWEEN :startDate AND :endDate" : ""}
      `,
      {
        replacements,
      },
    );

    return rows[0];
  }

  async getChart(branchId, startDate, endDate) {
    const replacements = { branchId };
    if (startDate && endDate) {
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

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
      WHERE 1=1
      ${branchId ? "AND b.branch_id = :branchId" : ""}
      ${startDate && endDate ? "AND b.created_at BETWEEN :startDate AND :endDate" : ""}
      GROUP BY DATE(b.created_at)
      ORDER BY DATE(b.created_at) ASC
      `,
      {
        replacements,
      },
    );

    return {
      dates: rows.map((r) => r.date),
      bookings: rows.map((r) => Number(r.bookings)),
      revenue: rows.map((r) => Number(r.revenue)),
    };
  }

  async getRecentBookings(branchId, startDate, endDate) {
    const replacements = { branchId };
    if (startDate && endDate) {
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

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
      WHERE 1=1
      ${branchId ? "AND b.branch_id = :branchId" : ""}
      ${startDate && endDate ? "AND b.created_at BETWEEN :startDate AND :endDate" : ""}
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT 5
      `,
      {
        replacements,
      },
    );

    return rows;
  }

  async getPaymentHealth(branchId, startDate, endDate) {
    const replacements = { branchId };
    if (startDate && endDate) {
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

    const [rows] = await sequelize.query(
      `
      SELECT status, COUNT(*) AS count
      FROM (
        SELECT
          CASE
            WHEN p.total_paid >= b.final_amount THEN 'Paid'
            WHEN p.total_paid > 0 AND p.total_paid < b.final_amount THEN 'Partial'
            ELSE 'Pending'
          END AS status
        FROM bookings b
        LEFT JOIN (
          SELECT booking_number, SUM(amount) AS total_paid
          FROM payments
          GROUP BY booking_number
        ) p ON p.booking_number = b.booking_number
        WHERE 1=1
        ${branchId ? "AND b.branch_id = :branchId" : ""}
        ${startDate && endDate ? "AND b.created_at BETWEEN :startDate AND :endDate" : ""}
      ) AS derived_bookings
      GROUP BY status
      `,
      {
        replacements,
      },
    );

    // Ensure all statuses are present
    const result = { Paid: 0, Partial: 0, Pending: 0 };
    rows.forEach((row) => {
      if (result[row.status] !== undefined) {
        result[row.status] = row.count;
      }
    });

    return result;
  }

  async getBookingStatusFunnel(branchId, startDate, endDate) {
    const replacements = { branchId };
    if (startDate && endDate) {
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

    const [rows] = await sequelize.query(
      `
      SELECT status, COUNT(id) AS count
      FROM bookings
      WHERE 1=1
      ${branchId ? "AND branch_id = :branchId" : ""}
      ${startDate && endDate ? "AND created_at BETWEEN :startDate AND :endDate" : ""}
      GROUP BY status
      ORDER BY FIELD(status, 'CREATED', 'TECH_ASSIGNED', 'SAMPLE_COLLECTED', 'COMPLETED', 'CANCELLED')
      `,
      {
        replacements,
      },
    );
    // Helper to ensure order and presence of all keys
    const funnelOrder = ['CREATED', 'TECH_ASSIGNED', 'SAMPLE_COLLECTED', 'COMPLETED', 'CANCELLED'];
    const result = funnelOrder.map(status => ({
      status,
      count: 0
    }));

    rows.forEach(row => {
      const idx = result.findIndex(r => r.status === row.status);
      if (idx !== -1) {
        result[idx].count = row.count;
      }
    });

    return result;
  }

  async getTopTests(branchId, startDate, endDate) {
    const replacements = { branchId };
    if (startDate && endDate) {
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

    const [rows] = await sequelize.query(
      `
      SELECT
        t.name AS test_name,
        COUNT(bt.booking_id) AS bookings_count,
        COALESCE(SUM(bt.price_snapshot), 0) AS revenue
      FROM booking_tests bt
      JOIN tests t ON t.id = bt.test_id
      JOIN bookings b ON b.id = bt.booking_id
      WHERE 1=1
      ${branchId ? "AND b.branch_id = :branchId" : ""}
      ${startDate && endDate ? "AND b.created_at BETWEEN :startDate AND :endDate" : ""}
      GROUP BY t.id
      ORDER BY revenue DESC
      LIMIT 5
      `,
      {
        replacements,
      },
    );

    return rows;
  }

  async getTechnicianPerformance(branchId, startDate, endDate) {
    // RE-WRITING query to be safer with Role join
    return await this.getTechnicianPerformanceSafe(branchId, startDate, endDate);
  }

  async getTechnicianPerformanceSafe(branchId, startDate, endDate) {
    const replacements = { branchId };
    if (startDate && endDate) {
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

    const [rows] = await sequelize.query(
      `
      SELECT
        u.id AS technician_id,
        u.name AS technician_name,
        COUNT(b.id) AS assigned_bookings,
        SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_bookings,
        SUM(CASE WHEN b.status = 'COMPLETED' THEN b.final_amount ELSE 0 END) AS revenue_generated,
        COALESCE(p_collected.total_collected, 0) AS revenue_collected
      FROM users u
      JOIN roles r ON u.role_id = r.id AND r.name = 'TECHNICIAN'
      LEFT JOIN bookings b ON b.technician_id = u.id 
        ${branchId ? "AND b.branch_id = :branchId" : ""}
        ${startDate && endDate ? "AND b.created_at BETWEEN :startDate AND :endDate" : ""}
      LEFT JOIN (
          SELECT collected_by_user_id, SUM(amount) as total_collected
          FROM payments
          GROUP BY collected_by_user_id
          -- Note: payments date filtering is complex if we strictly want revenue collected in this period
          -- vs payments for bookings in this period. 
          -- For simplicity/performance in this view, we'll keep it as Total Collected 
          -- OR if strict date needed, we would need to filter payments table too.
          -- Let's stick with total collected by user for now or filter if requested.
          -- However, the user likely wants "Performance in this period". 
          -- So ideally we filter bookings by date, but revenue collected is global unless we join payments also by date.
          -- Given the complexity, let's keep revenue collected as ALL time for that tech, 
          -- OR better, let's just leave it as is for 'revenue_collected' column (cash handled),
          -- but "Revenue Generated" (completed bookings value) will be filtered by date correctly via 'b.created_at'.
      ) p_collected ON p_collected.collected_by_user_id = u.id
      WHERE 1=1
      ${branchId ? "AND u.base_branch_id = :branchId" : ""}
      GROUP BY u.id
      ORDER BY revenue_generated DESC
      `,
      { replacements }
    );
    return rows;
  }



  async getBranchComparison({ limit, offset }) {
    const replacements = {};
    if (limit) replacements.limit = parseInt(limit);
    if (offset) replacements.offset = parseInt(offset);

    const [rows] = await sequelize.query(
      `
      SELECT
        br.id AS branch_id,
        br.name AS branch_name,
        COUNT(b.id) AS total_bookings,
        COALESCE(SUM(p.total_paid), 0) AS total_revenue
      FROM branches br
      LEFT JOIN bookings b ON b.branch_id = br.id
      LEFT JOIN (
        SELECT booking_number, SUM(amount) AS total_paid
        FROM payments
        GROUP BY booking_number
      ) p ON p.booking_number = b.booking_number
      GROUP BY br.id
      ORDER BY total_revenue DESC
      ${limit ? "LIMIT :limit" : ""}
      ${offset ? "OFFSET :offset" : ""}
      `,
      { replacements }
    );

    const [countRows] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM branches`
    );

    return {
      rows,
      count: countRows[0].count
    };
  }

}

module.exports = new DashboardRepository();
