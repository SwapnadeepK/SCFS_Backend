const express = require("express");
const router = express.Router();

const { getRoles, assignRole, getRoleMenu, getRequestableRoles } = require("../controllers/roleController.js");
const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");

router.get("/", authenticate, authorize("VIEW_USERS"), getRoles);

router.post("/assign", authenticate, authorize("ASSIGN_ROLE"), assignRole);

router.get("/:role/menu", authenticate, getRoleMenu);

router.get("/requestable", authenticate, getRequestableRoles);

module.exports = router;