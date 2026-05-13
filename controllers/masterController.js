const {
    getRoles,
    getDegrees,
    getSemesters,
    getStatusByType
} = require("../models/masterModel.js");
const { pool } = require("../config/db.js");

const rolesDropdown = async (req, res) => {
    const data = await getRoles();
    res.json(data);
};

const degreesDropdown = async (req, res) => {
    const data = await getDegrees();
    res.json(data);
};

const semestersDropdown = async (req, res) => {
    const data = await getSemesters();
    res.json(data);
};

const statusDropdown = async (req, res) => {
    const data = await getStatusByType(req.params.type);
    res.json(data);
};

/* =========================================
   COLLEGES DROPDOWN
========================================= */
const collegesDropdown = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        college_name
      FROM colleges
      ORDER BY college_name ASC
    `);

    res.json({
      success: true,
      data: rows,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch colleges",
    });
  }
};

/* =========================================
   DEPARTMENTS DROPDOWN
========================================= */
const departmentsDropdown = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        department_name
      FROM departments
      ORDER BY department_name ASC
    `);

    res.json({
      success: true,
      data: rows,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};

module.exports = {
    rolesDropdown,
    degreesDropdown,
    semestersDropdown,
    statusDropdown,
    collegesDropdown,
  departmentsDropdown,
};