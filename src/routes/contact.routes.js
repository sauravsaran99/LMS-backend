const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

// Public route to submit query
router.post("/", contactController.create);

// Protected route to view queries
router.get("/", contactController.getAll);

module.exports = router;
