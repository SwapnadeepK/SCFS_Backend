const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { getMyProfile } = require("../controllers/profileController");
const {
  checkProfileCompletion,
  completeProfile,
} = require("../controllers/userController");

/* CHECK PROFILE STATUS */
router.get(
  "/check",
  authenticate,
  checkProfileCompletion
);

/* COMPLETE PROFILE */
router.post(
  "/complete",
  authenticate,
  completeProfile
);

/* GET FULL PROFILE */
router.get(
  "/me",
  authenticate,
  getMyProfile
);

module.exports = router;