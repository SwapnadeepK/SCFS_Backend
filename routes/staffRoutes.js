const express = require("express");
const router = express.Router();

const { createStaffController } = require("../controllers/staffController.js");
const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");

router.post("/", authenticate, authorize("CREATE_USER"), createStaffController);

module.exports = router;