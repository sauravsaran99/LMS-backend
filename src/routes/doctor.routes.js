const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctor.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.use(auth);

router.post(
  '/',
  authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']),
  doctorController.createDoctor
);

router.get(
  '/',
  authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']),
  doctorController.getAllDoctors
);

module.exports = router;
