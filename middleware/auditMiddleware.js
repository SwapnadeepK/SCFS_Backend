const { pool } = require("../config/db.js");

const auditLog = (action) => {
    return async (req, res, next) => {
        res.on("finish", async () => {
            if (!req.user) return;

            await pool.query(`
                INSERT INTO master_log 
                (user_id, action_type, description, ip_address)
                VALUES (?, ?, ?, ?)
            `, [
                req.user.id,
                action,
                `${action} executed`,
                req.ip
            ]);
        });

        next();
    };
};

module.exports = { auditLog };