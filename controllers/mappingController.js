const { pool } = require("../config/db.js");

const assignDegree = async (req, res) => {
    const { college_id, department_id, degree_id } = req.body;

    await pool.query(`
        INSERT INTO college_degrees (college_id, department_id, degree_id)
        VALUES (?, ?, ?)
    `, [college_id, department_id, degree_id]);

    res.json({ message: "Mapped successfully" });
};

const getMappings = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT * FROM college_degrees
    `);

    res.json(rows);
};

module.exports = { assignDegree, getMappings };