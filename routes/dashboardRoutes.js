const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { getAdminDashboard } = require("../controllers/dashboardController");
const { authorize } = require("../middleware/rbacMiddleware.js");

router.get( "/admin", authenticate, authorize("VIEW_ADMIN_DASHBOARD"), getAdminDashboard);

module.exports = router;