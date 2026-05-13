const { pool } = require("../config/db.js");

const getAllColleges = async () => {
    const [rows] = await pool.query("SELECT id, college_name FROM colleges");
    return rows;
};

const getDepartmentsByCollege = async (collegeId) => {
    const [rows] = await pool.query(
        "SELECT id, department_name FROM departments WHERE college_id = ?",
        [collegeId]
    );
    return rows;
};

const getDegreesByDepartment = async (collegeId, departmentId) => {
    const [rows] = await pool.query(`
        SELECT d.id, d.degree_name
        FROM college_degrees cd
        JOIN degrees d ON cd.degree_id = d.id
        WHERE cd.college_id = ? AND cd.department_id = ?
    `, [collegeId, departmentId]);

    return rows;
};

module.exports = {
    getAllColleges,
    getDepartmentsByCollege,
    getDegreesByDepartment
};