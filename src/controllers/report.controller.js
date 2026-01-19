const reportService = require("../services/report.service");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");

exports.getSummaryReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({
        message: "from_date and to_date are required",
      });
    }

    const fromDate = from_date;
    const toDate = to_date;

    const branchId = req.user.base_branch_id || undefined;

    const data = await reportService.getSummaryReport(
      fromDate,
      toDate,
      branchId,
    );

    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getBranchWiseMonthly = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res
        .status(400)
        .json({ message: "from_date and to_date required" });
    }

    const data = await reportService.getBranchWiseMonthly(
      req.user,
      (fromDate = from_date),
      (toDate = to_date),
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load branch report" });
  }
};

exports.exportSummaryCSV = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res
        .status(400)
        .json({ message: "from_date and to_date required" });
    }

    const fromDate = from_date;
    const toDate = to_date;

    const branchId = req.user.base_branch_id || undefined;

    const data = await reportService.getSummaryReport(
      fromDate,
      toDate,
      branchId,
    );

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`report_${from_date}_to_${to_date}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

exports.exportSummaryExcel = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res
        .status(400)
        .json({ message: "from_date and to_date required" });
    }

    const fromDate = from_date;
    const toDate = to_date;

    const branchId = req.user.base_branch_id || undefined;

    const data = await reportService.getSummaryReport(
      fromDate,
      toDate,
      branchId,
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Summary Report");

    const rowData = data; // ✅ object, not array

    sheet.columns = Object.keys(rowData).map((key) => ({
      header: key.replace(/_/g, " ").toUpperCase(),
      key,
    }));

    sheet.addRow(rowData);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report_${from_date}_to_${to_date}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export Excel" });
  }
};

exports.getTechnicianWiseMonthly = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res
        .status(400)
        .json({ message: "from_date and to_date required" });
    }

    const data = await reportService.getTechnicianWiseMonthly(
      req.user,
      from_date,
      to_date,
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load technician report" });
  }
};

exports.getTestWiseMonthly = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res
        .status(400)
        .json({ message: "from_date and to_date required" });
    }

    const data = await reportService.getTestWiseMonthly(
      req.user,
      from_date,
      to_date,
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load test report" });
  }
};
