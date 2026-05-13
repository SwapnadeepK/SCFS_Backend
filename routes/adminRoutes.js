const express = require("express");
const router = express.Router();

const { getSystemStats } = require("../controllers/adminController.js");
const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");

router.get("/stats", authenticate, authorize("VIEW_LOGS"), getSystemStats);

module.exports = router;