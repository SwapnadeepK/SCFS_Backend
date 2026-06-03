const express = require("express");

const router =
  express.Router();

const {
  createPayment,
  getApprovals,
  approve,
} = require(
  "../controllers/feePaymentController"
);

/* =========================================
   STUDENT PAYMENT
========================================= */
router.post(
  "/submit",
  createPayment
);

/* =========================================
   ADMIN APPROVALS
========================================= */
router.get(
  "/approvals",
  getApprovals
);

router.put(
  "/approve/:id",
  approve
);

module.exports = router;