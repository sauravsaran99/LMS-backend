const ExcelJS = require("exceljs");

exports.exportExcel = async (res, data, filename) => {
  if (!data || !data.length) {
    return res.status(400).json({ message: "No data to export" });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  sheet.columns = Object.keys(data[0]).map((key) => ({
    header: key.replace(/_/g, " ").toUpperCase(),
    key,
    width: 20,
  }));

  data.forEach((row) => sheet.addRow(row));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};
