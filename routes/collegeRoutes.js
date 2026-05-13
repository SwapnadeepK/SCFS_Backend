const express = require("express");
const router = express.Router();

const { createCollege, getColleges } = require("../controllers/collegeController.js");
const { authenticate } = require("../middleware/authMiddleware.js");
const { authorize } = require("../middleware/rbacMiddleware.js");
const {
    getCollegesDropdown,
    getDepartments,
    getDegrees
} = require("../controllers/collegeController.js");


router.post("/", authenticate, authorize("CREATE_COLLEGE"), createCollege);

router.get("/", authenticate, authorize("VIEW_COLLEGE"), getColleges);

router.get("/dropdown", getCollegesDropdown);
router.get("/:collegeId/departments", getDepartments);
router.get("/:collegeId/:departmentId/degrees", getDegrees);


module.exports = router;