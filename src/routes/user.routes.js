const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

router.get(
    "/",
    auth,
    authorize(["SUPER_ADMIN", "BRANCH_ADMIN", "RECEPTIONIST"]),
    userController.getUsers
);

module.exports = router;
