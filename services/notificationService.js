const { pool } = require("../config/db.js");

const sendNotification = async (userId, message) => {
    await pool.query(`
        INSERT INTO notifications (user_id, message)
        VALUES (?, ?)
    `, [userId, message]);
};

module.exports = { sendNotification };