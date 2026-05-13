const express = require("express");
const router = express.Router();

const {
  requestRole,
  getPendingRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  getMyRoleRequest
} = require("../controllers/roleRequestController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/rbacMiddleware");

/* =========================================
   USER → REQUEST ROLE
========================================= */
router.post(
  "/request",
  authenticate,
  requestRole
);

/* =========================================
   ADMIN → GET ALL PENDING / UNVERIFIED
========================================= */
router.get(
  "/",
  authenticate,
  authorize("APPROVE_ROLE_REQUEST"),
  getPendingRoleRequests
);

/* =========================================
   ADMIN → APPROVE REQUEST
========================================= */
router.post(
  "/approve",
  authenticate,
  authorize("APPROVE_ROLE_REQUEST"),
  approveRoleRequest
);

/* =========================================
   ADMIN → REJECT REQUEST
========================================= */
router.post(
  "/reject",
  authenticate,
  authorize("APPROVE_ROLE_REQUEST"),
  rejectRoleRequest
);

router.get("/my", authenticate, getMyRoleRequest);

module.exports = router;