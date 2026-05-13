const { pool } = require("../config/db.js");

const getRoles = async () => {
    const [rows] = await pool.query("SELECT id, role_name FROM roles");
    return rows;
};

const getDegrees = async () => {
    const [rows] = await pool.query("SELECT id, degree_name FROM degrees");
    return rows;
};

const getSemesters = async () => {
    const [rows] = await pool.query("SELECT id, semester_name FROM semesters");
    return rows;
};

const getStatusByType = async (type) => {
    const [rows] = await pool.query(
        "SELECT id, status_value FROM status_master WHERE status_type = ?",
        [type]
    );
    return rows;
};

module.exports = {
    getRoles,
    getDegrees,
    getSemesters,
    getStatusByType
};