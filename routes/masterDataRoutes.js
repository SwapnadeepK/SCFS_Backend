const express = require("express");
const router = express.Router();

const {
  getColleges,
  getDepartments,
  getDegrees,
  getSemesters,
} = require("../controllers/masterDataController");

/* PUBLIC (no auth needed for dropdowns) */
router.get("/colleges", getColleges);
router.get("/departments", getDepartments);
router.get("/degrees", getDegrees);
router.get("/semesters", getSemesters);

module.exports = router;