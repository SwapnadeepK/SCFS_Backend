const { pool } = require("../config/db.js");

const findUserByEmail = async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
};

const getAllUsers = async () => {
    const [rows] = await pool.query(`
  SELECT 
    u.*,
    r.role_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
`);
    return rows;
};

const searchUsers = async (name = "", email = "") => {
    const [rows] = await pool.query(
        `
        SELECT 
  u.*, 
  p.full_name,
  r.role_name
FROM users u
JOIN user_profiles p ON u.id = p.user_id
LEFT JOIN roles r ON r.id = u.role_id
WHERE p.full_name LIKE ? AND u.email LIKE ?
        `,
        [`%${name}%`, `%${email}%`]
    );

    return rows;
};

const updateUserRole = async (userId, roleId) => {
    await pool.query(
        "UPDATE users SET role_id = ? WHERE id = ?",
        [roleId, userId]
    );
};

const updatePasswordByEmail = async (email, hashedPassword) => {
    const [result] = await pool.query(
        "UPDATE users SET password_hash = ? WHERE email = ?",
        [hashedPassword, email]
    );

    return result.affectedRows;
};

module.exports = {
    findUserByEmail,
    getAllUsers,
    updateUserRole, searchUsers, updatePasswordByEmail
};