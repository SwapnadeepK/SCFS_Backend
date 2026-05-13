const { getAllUsers, updateUserRole, updatePasswordByEmail } = require("../models/userModel.js");
const { getRolesList } = require("../models/roleModel.js");
const { pool } = require("../config/db.js");
const bcrypt = require("bcrypt");

const getUsersService = async () => {
    return await getAllUsers();
};

const getRolesService = async () => {
    return await getRolesList();
};

const assignRoleService = async (userId, roleId) => {
    await updateUserRole(userId, roleId);
};

const createCollegeService = async (data) => {
    const { uuid, code, name, date } = data;

    await pool.query(`
        INSERT INTO colleges (uuid, college_code, college_name, establishment_date)
        VALUES (UUID_TO_BIN(?), ?, ?, ?)
    `, [uuid, code, name, date]);
};

const getCollegesService = async () => {
    const [rows] = await pool.query("SELECT * FROM colleges");
    return rows;
};

const changeUserPassword = async (email, newPassword) => {
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updated = await updatePasswordByEmail(
        email,
        hashedPassword
    );

    if (!updated) {
        throw new Error("User not found or password not updated");
    }

    return true;
};

module.exports = {
    getUsersService,
    getRolesService,
    assignRoleService,
    createCollegeService,
    getCollegesService,
    changeUserPassword
};