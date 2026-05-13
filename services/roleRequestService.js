const { pool } = require("../config/db.js");

const requestRoleChange = async (userId, roleId) => {
    await pool.query(`
        INSERT INTO role_requests (user_id, requested_role_id, approval_status_id)
        VALUES (
            ?, ?, 
            (SELECT id FROM status_master WHERE status_type='APPROVAL_STATUS' AND status_value='PENDING')
        )
    `, [userId, roleId]);
};

module.exports = { requestRoleChange };