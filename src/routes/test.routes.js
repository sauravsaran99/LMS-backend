const express = require('express');
const router = express.Router();

const testController = require('../controllers/test.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.use(auth);

router.post(
  '/',
  authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']),
  testController.createTest
);

router.get(
  '/',
  authorize(['SUPER_ADMIN', 'BRANCH_ADMIN', 'RECEPTIONIST']),
  testController.getAllTests
);

router.put(
  '/:id',
  authorize(['SUPER_ADMIN', 'BRANCH_ADMIN']),
  testController.updateTest
);

module.exports = router;
