const { pool } = require("../config/db.js");
const { generateUUID } = require("../utils/uuid.js");

const registerStudentService = async (data) => {
    const {
        email,
        password_hash,
        full_name,
        college_id,
        department_id,
        degree_id,
        semester_id,
        batch_year
    } = data;

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        const [userResult] = await conn.query(`
            INSERT INTO users (uuid, college_assigned_id, email, password_hash, role_id, status_id)
            VALUES (
                UUID_TO_BIN(?),
                UUID(),
                ?,
                ?,
                (SELECT id FROM roles WHERE role_name='STUDENT'),
                (SELECT id FROM status_master WHERE status_type='USER_STATUS' AND status_value='INACTIVE')
            )
        `, [generateUUID(), email, password_hash]);

        const userId = userResult.insertId;

        await conn.query(`
            INSERT INTO user_profiles (user_id, full_name)
            VALUES (?, ?)
        `, [userId, full_name]);

        await conn.query(`
            INSERT INTO student_details 
            (user_id, college_id, department_id, degree_id, semester_id, batch_year, approval_status_id)
            VALUES (
                ?, ?, ?, ?, ?, ?, 
                (SELECT id FROM status_master WHERE status_type='APPROVAL_STATUS' AND status_value='PENDING')
            )
        `, [userId, college_id, department_id, degree_id, semester_id, batch_year]);

        await conn.commit();
        return userId;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

module.exports = { registerStudentService };