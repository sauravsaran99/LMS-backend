const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
// Assuming authentication middleware exists, checking access control
// const { authenticate, authorize } = require("../middleware/auth.middleware");

// Public routes
router.get("/", blogController.getAll);
router.get("/:id", blogController.getById);

// Protected routes (Add authentication middleware later as needed for these)
router.post("/", blogController.create);
router.put("/:id", blogController.update);
router.delete("/:id", blogController.delete);

module.exports = router;
