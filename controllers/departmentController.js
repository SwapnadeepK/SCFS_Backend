const { pool } = require("../config/db.js");
const {
  getDepartmentsByCollegeService,
} = require("../services/departmentService");

const createDepartment = async (req, res) => {
    const { uuid, code, name, college_id } = req.body;

    await pool.query(`
        INSERT INTO departments (uuid, department_code, department_name, college_id)
        VALUES (UUID_TO_BIN(?), ?, ?, ?)
    `, [uuid, code, name, college_id]);

    res.json({ message: "Department created" });
};

const updateDepartment = async (req, res) => {
    const { name } = req.body;

    await pool.query(
        "UPDATE departments SET department_name=? WHERE id=?",
        [name, req.params.id]
    );

    res.json({ message: "Updated" });
};

const deleteDepartment = async (req, res) => {
    await pool.query("DELETE FROM departments WHERE id=?", [req.params.id]);
    res.json({ message: "Deleted" });
};

const getDepartmentsByCollege = async (
  req,
  res
) => {
  try {
    const { collegeId } = req.params;

    const data =
      await getDepartmentsByCollegeService(
        collegeId
      );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch departments",
    });
  }
};

module.exports = {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentsByCollege
};