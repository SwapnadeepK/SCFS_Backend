const { pool } = require("../config/db.js");

const getPermissionsByUser = async (userId) => {
    const [rows] = await pool.query(`
        SELECT p.permission_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = ?
    `, [userId]);

    return rows.map(r => r.permission_name);
};

module.exports = { getPermissionsByUser };