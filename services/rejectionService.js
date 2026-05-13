const { pool } = require("../config/db.js");

const rejectUser = async (userId) => {
    await pool.query(`
        UPDATE users 
        SET status_id = (
            SELECT id FROM status_master 
            WHERE status_type='USER_STATUS' AND status_value='REJECTED'
        )
        WHERE id = ?
    `, [userId]);
};

const rejectRoleRequest = async (id) => {
    await pool.query(`
        UPDATE role_requests 
        SET approval_status_id = (
            SELECT id FROM status_master 
            WHERE status_type='APPROVAL_STATUS' AND status_value='REJECTED'
        )
        WHERE id = ?
    `, [id]);
};

module.exports = {
    rejectUser,
    rejectRoleRequest
};