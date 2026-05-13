const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");

const { getUsers, searchUsers, changePassword, checkProfileCompletion, getProfileStatus, completeProfile } = require("../controllers/userController.js");
const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");

router.get(
    "/",
    authenticate,
    authorize("VIEW_USERS"),
    asyncHandler(getUsers)
);

router.get(
    "/search",
    authenticate,
    authorize("VIEW_USERS"),
    asyncHandler(searchUsers)
);

// Only admin or self-access (adjust permission as needed)
router.put(
    "/change-password",
    authenticate,
    authorize("UPDATE_USER"), // or custom permission
    asyncHandler(changePassword)
);

router.get(
  "/profile/check",
  authenticate,
  checkProfileCompletion
);

router.get("/profile/status", authenticate, getProfileStatus);
router.post("/profile/complete", authenticate, completeProfile);

module.exports = router;