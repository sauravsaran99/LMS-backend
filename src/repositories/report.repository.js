const { sequelize } = require('../models');

class ReportRepository {

  async getSummaryReport(fromDate, toDate, branchId) {
    let whereClause = `
    WHERE DATE(b.created_at) BETWEEN :fromDate AND :toDate
  `;

    const replacements = { fromDate, toDate };

    if (branchId !== undefined) {
      whereClause += ` AND b.branch_id = :branchId`;
      replacements.branchId = branchId;
    }

    const [rows] = await sequelize.query(`
    SELECT
      COUNT(b.id) AS total_bookings,

      SUM(
        CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END
      ) AS completed_bookings,

      COALESCE(SUM(p.total_paid), 0) AS total_paid,

      COALESCE(SUM(b.discount_amount), 0) AS discount_given,

      (
        COALESCE(SUM(p.total_paid), 0)
        - COALESCE(SUM(b.discount_amount), 0)
      ) AS discounted_revenue,

      SUM(
        CASE
          WHEN COALESCE(p.total_paid, 0) < b.final_amount THEN 1
          ELSE 0
        END
      ) AS pending_payments,

      COALESCE(SUM(r.total_refunded), 0) AS total_refunded

    FROM bookings b

    LEFT JOIN (
      SELECT booking_number, SUM(amount) AS total_paid
      FROM payments
      GROUP BY booking_number
    ) p ON p.booking_number = b.booking_number

    LEFT JOIN (
      SELECT booking_number, SUM(amount) AS total_refunded
      FROM refunds
      GROUP BY booking_number
    ) r ON r.booking_number = b.booking_number

    ${whereClause}
  `, { replacements });

    return rows[0];
  }







  async getBranchWiseMonthly({ fromDate, toDate, branchId }) {
    console.log('fromDate, toDate, branchId', fromDate, toDate, branchId);

    if (!fromDate || !toDate) {
      throw new Error("fromDate and toDate are required");
    }

    let whereClause = "";
    const replacements = { fromDate, toDate };

    if (branchId) {
      whereClause = `WHERE br.id = :branchId`;
      replacements.branchId = branchId;
    }

    const [rows] = await sequelize.query(`
    SELECT
      br.id AS branch_id,
      br.name AS branch_name,

      COUNT(b.id) AS total_bookings,

      SUM(
        CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END
      ) AS completed_bookings,

      /* 🔹 Gross Revenue = what customer should pay */
      COALESCE(SUM(b.final_amount), 0) AS gross_revenue,

      /* 🔹 Discount Given */
      COALESCE(SUM(b.discount_amount), 0) AS discount_given,

      /* 🔹 Total Paid */
      COALESCE(SUM(p.total_paid), 0) AS total_paid,

      /* 🔹 Total Refunded */
      COALESCE(SUM(r.total_refunded), 0) AS total_refunded,

      /* 🔹 Net Revenue = cash actually retained */
      (
        COALESCE(SUM(p.total_paid), 0)
        - COALESCE(SUM(r.total_refunded), 0)
      ) AS net_revenue

    FROM branches br

    LEFT JOIN bookings b
      ON b.branch_id = br.id
      AND DATE(b.created_at) BETWEEN :fromDate AND :toDate

    LEFT JOIN (
      SELECT booking_number, SUM(amount) AS total_paid
      FROM payments
      GROUP BY booking_number
    ) p ON p.booking_number = b.booking_number

    LEFT JOIN (
      SELECT booking_number, SUM(amount) AS total_refunded
      FROM refunds
      GROUP BY booking_number
    ) r ON r.booking_number = b.booking_number

    ${whereClause}

    GROUP BY br.id, br.name
    ORDER BY br.name ASC
  `, {
      replacements
    });

    return rows;
  }




  async getTechnicianWiseMonthly({ fromDate, toDate, branchId }) {
    if (!fromDate || !toDate) {
      throw new Error("fromDate and toDate are required");
    }

    let whereClause = `WHERE DATE(b.created_at) BETWEEN :fromDate AND :toDate`;
    const replacements = { fromDate, toDate };

    if (branchId) {
      whereClause += ` AND b.branch_id = :branchId`;
      replacements.branchId = branchId;
    }

    const [rows] = await sequelize.query(`
    SELECT
      u.id AS technician_id,
      u.name AS technician_name,

      COUNT(b.id) AS tests_assigned,

      SUM(
        CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END
      ) AS tests_completed,

      COALESCE(SUM(b.final_amount), 0) AS gross_revenue,

      COALESCE(SUM(b.discount_amount), 0) AS discount_given,

      COALESCE(SUM(p.total_paid), 0) AS total_paid,

      COALESCE(SUM(r.total_refunded), 0) AS total_refunded,

      (
        COALESCE(SUM(p.total_paid), 0)
        - COALESCE(SUM(r.total_refunded), 0)
      ) AS net_revenue

    FROM bookings b
    JOIN users u ON u.id = b.technician_id

    LEFT JOIN (
      SELECT booking_number, SUM(amount) AS total_paid
      FROM payments
      GROUP BY booking_number
    ) p ON p.booking_number = b.booking_number

    LEFT JOIN (
      SELECT booking_number, SUM(amount) AS total_refunded
      FROM refunds
      GROUP BY booking_number
    ) r ON r.booking_number = b.booking_number

    ${whereClause}
    GROUP BY u.id, u.name
    ORDER BY u.name ASC
  `, {
      replacements
    });

    return rows;
  }




  async getTestWiseMonthly({ fromDate, toDate, branchId }) {
    if (!fromDate || !toDate) {
      throw new Error("fromDate and toDate are required");
    }

    let whereClause = `WHERE DATE(b.created_at) BETWEEN :fromDate AND :toDate`;
    const replacements = { fromDate, toDate };

    if (branchId) {
      whereClause += ` AND b.branch_id = :branchId`;
      replacements.branchId = branchId;
    }

    const [rows] = await sequelize.query(`
    SELECT
      t.id AS test_id,
      t.name AS test_name,

      COUNT(bt.id) AS tests_booked,

      SUM(
        CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END
      ) AS tests_completed,

      /* 🔹 Gross Revenue (price snapshot) */
      COALESCE(SUM(bt.price_snapshot), 0) AS gross_revenue,

      /* 🔹 Proportional Discount */
      COALESCE(SUM(
        (bt.price_snapshot / b.original_amount) * b.discount_amount
      ), 0) AS discount_given,

      /* 🔹 Net Revenue */
      COALESCE(SUM(
        bt.price_snapshot -
        ((bt.price_snapshot / b.original_amount) * b.discount_amount)
      ), 0) AS net_revenue

    FROM booking_tests bt
    JOIN bookings b ON b.id = bt.booking_id
    JOIN tests t ON t.id = bt.test_id

    ${whereClause}

    GROUP BY t.id, t.name
    ORDER BY t.name ASC
  `, {
      replacements
    });

    return rows;
  }






}

module.exports = new ReportRepository();
