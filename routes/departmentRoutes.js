const express = require("express");
const router = express.Router();

const {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentsByCollege
} = require("../controllers/departmentController.js");

router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);
router.get("/college/:collegeId", getDepartmentsByCollege);

module.exports = router;