const { pool } = require("../config/db.js");

const getMyProfile = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT u.email, p.full_name, s.usn
        FROM users u
        JOIN user_profiles p ON u.id = p.user_id
        JOIN student_details s ON u.id = s.user_id
        WHERE u.id = ?
    `, [req.user.id]);

    res.json(rows[0]);
};

const getMyFees = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT f.*, fs.amount
        FROM fees f
        JOIN fee_structures fs ON f.fee_structure_id = fs.id
        WHERE f.student_id = ?
    `, [req.user.id]);

    res.json(rows);
};

module.exports = {
    getMyProfile,
    getMyFees
};