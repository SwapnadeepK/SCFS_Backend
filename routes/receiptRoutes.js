const express = require("express");

const router = express.Router();

const { downloadReceipt, } = require( "../controllers/receiptController");

router.get("/:feeId", downloadReceipt);

module.exports = router;