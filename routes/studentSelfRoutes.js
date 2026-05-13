const express = require("express");
const router = express.Router();

const {
    getMyProfile,
    getMyFees
} = require("../controllers/studentSelfController.js");

const { authenticate } = require("../middleware/authMiddleware.js");

router.get("/profile", authenticate, getMyProfile);
router.get("/fees", authenticate, getMyFees);

module.exports = router;