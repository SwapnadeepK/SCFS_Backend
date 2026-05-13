const express = require("express");
const router = express.Router();

const {
    assignDegree,
    getMappings
} = require("../controllers/mappingController.js");

const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");

// Assign degree to college + department
router.post(
    "/",
    authenticate,
    authorize("MANAGE_COLLEGE"),
    assignDegree
);

// Get all mappings
router.get(
    "/",
    authenticate,
    authorize("VIEW_COLLEGE"),
    getMappings
);

module.exports = router;