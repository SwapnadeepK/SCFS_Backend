const { pool } = require("../config/db.js");

const getNotifications = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `, [req.user.id]);

    res.json(rows);
};

const markAsRead = async (req, res) => {
    await pool.query(`
        UPDATE notifications SET is_read = TRUE WHERE id = ?
    `, [req.params.id]);

    res.json({ message: "Marked as read" });
};

module.exports = { getNotifications, markAsRead };