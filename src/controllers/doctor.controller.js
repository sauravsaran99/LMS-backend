const { Doctor } = require('../models');

exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  const doctors = await Doctor.findAll();
  res.json(doctors);
};
