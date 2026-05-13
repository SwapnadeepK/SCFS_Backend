const express = require("express");

const router = express.Router();

const {
  getFeeStructure,
  createFeeStructure,
} = require("../controllers/feeStructureController.js");

/* =====================================
   GET
===================================== */
router.get("/", getFeeStructure);

/* =====================================
   CREATE
===================================== */
router.post("/", createFeeStructure);

module.exports = router;