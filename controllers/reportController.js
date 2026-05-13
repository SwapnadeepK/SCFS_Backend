const { pool } = require("../config/db.js");

const revenueReport = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT SUM(amount) as total FROM fee_transactions
        WHERE payment_status_id = (
            SELECT id FROM status_master WHERE status_type='PAYMENT_STATUS' AND status_value='SUCCESS'
        )
    `);

    res.json(rows[0]);
};

const pendingApprovals = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT COUNT(*) as pending FROM student_details
        WHERE approval_status_id = (
            SELECT id FROM status_master WHERE status_type='APPROVAL_STATUS' AND status_value='PENDING'
        )
    `);

    res.json(rows[0]);
};

module.exports = {
    revenueReport,
    pendingApprovals
};