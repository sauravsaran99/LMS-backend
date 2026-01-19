const { Parser } = require("json2csv");

exports.exportCSV = (res, data, filename) => {
  if (!data || !data.length) {
    return res.status(400).json({ message: "No data to export" });
  }

  const parser = new Parser({ flatten: true });
  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment(`${filename}.csv`);
  return res.send(csv);
};
