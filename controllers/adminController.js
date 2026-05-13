const { pool } = require("../config/db.js");

const getSystemStats = async (req, res) => {
    const [[users]] = await pool.query("SELECT COUNT(*) as total FROM users");
    const [[fees]] = await pool.query("SELECT SUM(amount) as total FROM fee_transactions WHERE payment_status_id = (SELECT id FROM status_master WHERE status_type='PAYMENT_STATUS' AND status_value='SUCCESS')");

    res.json({
        totalUsers: users.total,
        revenue: fees.total || 0
    });
};

module.exports = { getSystemStats };