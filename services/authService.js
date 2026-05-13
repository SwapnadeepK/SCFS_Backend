const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail } = require("../models/userModel.js");
const { config } = require("../config/config.js");

const loginService = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign(
        { id: user.id, role_id: user.role_id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );

    return token;
};

module.exports = { loginService };