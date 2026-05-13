const { pool } = require("../config/db.js");

const approveUser = async (userId, approverId) => {
    await pool.query(`
        UPDATE users 
        SET status_id = (
            SELECT id FROM status_master 
            WHERE status_type='USER_STATUS' AND status_value='ACTIVE'
        )
        WHERE id = ?
    `, [userId]);

    await logAction(approverId, "APPROVE_USER", "users", userId);
};

const approveStudent = async (studentId, approverId) => {
    await pool.query(`
        UPDATE student_details 
        SET approval_status_id = (
            SELECT id FROM status_master 
            WHERE status_type='APPROVAL_STATUS' AND status_value='APPROVED'
        )
        WHERE user_id = ?
    `, [studentId]);

    await logAction(approverId, "APPROVE_STUDENT", "student_details", studentId);
};

const approveFee = async (feeId, approverId) => {
    await pool.query(`
        UPDATE fees 
        SET approval_status_id = (
            SELECT id FROM status_master 
            WHERE status_type='APPROVAL_STATUS' AND status_value='APPROVED'
        ),
        approved_by = ?,
        approved_at = NOW()
        WHERE id = ?
    `, [approverId, feeId]);

    await logAction(approverId, "APPROVE_FEE", "fees", feeId);
};

const approveRoleRequest = async (requestId, approverId) => {
    await pool.query(`
        UPDATE role_requests 
        SET approval_status_id = (
            SELECT id FROM status_master 
            WHERE status_type='APPROVAL_STATUS' AND status_value='APPROVED'
        ),
        reviewed_by = ?,
        reviewed_at = NOW()
        WHERE id = ?
    `, [approverId, requestId]);
};

const logAction = async (userId, action, entity, entityId) => {
    await pool.query(`
        INSERT INTO master_log (user_id, action_type, entity_type, entity_id, description)
        VALUES (?, ?, ?, ?, ?)
    `, [userId, action, entity, entityId, `${action} performed`]);
};

module.exports = {
    approveUser,
    approveStudent,
    approveFee,
    approveRoleRequest
};