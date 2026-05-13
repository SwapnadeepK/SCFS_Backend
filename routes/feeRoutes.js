const express = require("express");
const router = express.Router();

const { getAllFees, getReports, getMyFees,
  approveFeePayment,
  getPendingFeeApprovals,
  payFee, } = require("../controllers/feeController.js");
const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");

router.get(
    "/",
    authenticate,
    authorize("VIEW_ALL_FEES"),
    getAllFees
);

router.get(
    "/reports",
    authenticate,
    authorize("VIEW_ALL_FEES"),
    getReports
);

/* =========================================
   STUDENT -> MY FEES
========================================= */
router.get(
  "/my",
  authenticate,
  authorize("PAY_FEES"),
  getMyFees
);

/* =========================================
   STUDENT -> PAY FEES
========================================= */
router.post(
  "/pay",
  authenticate,
  authorize("PAY_FEES"),
  payFee
);

/* =========================================
   ADMIN -> VIEW APPROVALS
========================================= */
router.get(
  "/approvals",
  authenticate,
  authorize("APPROVE_FEES"),
  getPendingFeeApprovals
);

/* =========================================
   ADMIN -> APPROVE PAYMENT
========================================= */
router.post(
  "/approve",
  authenticate,
  authorize("APPROVE_FEES"),
  approveFeePayment
);

module.exports = router;