const express = require("express");
const router = express.Router();
const branchTestPriceController = require("../controllers/branchTestPrice.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// All routes here require SUPER_ADMIN
router.use(authMiddleware);
router.use(roleMiddleware(["SUPER_ADMIN"]));

router.post("/", branchTestPriceController.setBranchPrice);
router.get("/test/:test_id", branchTestPriceController.getBranchPricesByTest);
router.delete("/:id", branchTestPriceController.deleteBranchPrice);

module.exports = router;
