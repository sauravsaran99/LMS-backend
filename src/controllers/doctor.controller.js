const { Doctor } = require("../models");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  const paginationParams = getPaginationParams(req.query);
  const options = {};

  if (paginationParams) {
    options.limit = paginationParams.limit;
    options.offset = paginationParams.offset;
  }

  if (paginationParams) {
    const result = await Doctor.findAndCountAll(options);
    res.json(
      getPaginatedResponse(
        result.rows,
        result.count,
        paginationParams.page,
        paginationParams.limit,
      ),
    );
  } else {
    const doctors = await Doctor.findAll();
    res.json(doctors);
  }
};
