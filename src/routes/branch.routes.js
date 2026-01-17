const express = require("express");
const router = express.Router();

const branchController = require("../controllers/branch.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

router.use(auth, authorize(['SUPER_ADMIN']));

router.post('/', branchController.createBranch);
router.get('/', branchController.getBranches);
router.put('/:id', branchController.updateBranch);
router.patch('/:id/status', branchController.updateBranchStatus);

module.exports = router;
