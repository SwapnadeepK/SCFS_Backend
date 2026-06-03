const express = require("express");

const router = express.Router();

const {
  getMyFees,
} = require("../controllers/studentFeeController");

/* =========================================
   GET STUDENT FEES
========================================= */
router.get(
  "/my-fees/:studentId",
  getMyFees
);

module.exports = router;