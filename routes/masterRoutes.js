const express = require("express");
const router = express.Router();

const {
    rolesDropdown,
    degreesDropdown,
    semestersDropdown,
    statusDropdown,
    collegesDropdown,
  departmentsDropdown,
} = require("../controllers/masterController.js");

router.get("/roles", rolesDropdown);
router.get("/degrees", degreesDropdown);
router.get("/semesters", semestersDropdown);
router.get("/status/:type", statusDropdown);

/* =========================================
   NEW
========================================= */
router.get("/colleges", collegesDropdown);

router.get("/departments", departmentsDropdown);

module.exports = router;