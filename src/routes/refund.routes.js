const express = require('express');
const router = express.Router();

const refundController = require('../controllers/refund.controller');
const auth = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload');

router.use(auth);

router.post(
    "/",
    auth,
    authorize(["RECEPTIONIST", "BRANCH_ADMIN"]),
    refundController.createRefund
);



module.exports = router;