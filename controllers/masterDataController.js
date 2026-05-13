const { pool } = require("../config/db");

/* =========================
   COLLEGES
========================= */
const getColleges = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, college_name
      FROM colleges
      ORDER BY college_name
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch colleges" });
  }
};

/* =========================
   DEPARTMENTS
========================= */
const getDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, department_name
      FROM departments
      ORDER BY department_name
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

/* =========================
   DEGREES
========================= */
const getDegrees = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, degree_name
      FROM degrees
      ORDER BY degree_name
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch degrees" });
  }
};

/* =========================
   SEMESTERS
========================= */
const getSemesters = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, semester_name
      FROM semesters
      ORDER BY id
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch semesters" });
  }
};

module.exports = {
  getColleges,
  getDepartments,
  getDegrees,
  getSemesters,
};