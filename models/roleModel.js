const { pool } = require("../config/db.js");

const getRolesList = async () => {
    const [rows] = await pool.query("SELECT * FROM roles");
    return rows;
};

module.exports = { getRolesList };