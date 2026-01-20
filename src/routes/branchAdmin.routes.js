const express = require("express");
const router = express.Router();

const controller = require("../controllers/branchAdmin.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

router.use(auth, authorize(["BRANCH_ADMIN", "SUPER_ADMIN"]));

router.get("/users", controller.getBranchUsers);
router.post("/users", controller.createBranchUser);
router.patch("/users/:id/status", controller.toggleUserStatus);
router.post("/", controller.createBranchAdmin);

router.get("/", controller.getBranchAdmins);

module.exports = router;
