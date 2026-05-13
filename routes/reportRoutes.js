const express = require("express");
const router = express.Router();

const {
    revenueReport,
    pendingApprovals
} = require("../controllers/reportController.js");

const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");

// Revenue report
router.get(
    "/revenue",
    authenticate,
    authorize("VIEW_REPORTS"),
    revenueReport
);

// Pending approvals
router.get(
    "/pending-approvals",
    authenticate,
    authorize("VIEW_REPORTS"),
    pendingApprovals
);

module.exports = router;