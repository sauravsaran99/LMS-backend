const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const discountController = require('../controllers/discount.controller');

router.use(auth);

router.post(
  '/preview',
  authorize(['SUPER_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST']),
  discountController.previewDiscount
);

module.exports = router;
