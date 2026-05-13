const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("../config/db.js");

/* ================================
   LOGIN
================================ */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(`
      SELECT u.*, r.role_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.email = ?
    `, [email]);

    if (!users.length) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    // console.log("Entered password:", password);
    // console.log("Stored hash:", user.password_hash);
    // console.log("Match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
  {
    id: user.id,
    role: user.role_name,
    role_id: user.role_id   // 🔥 THIS LINE IS MISSING IN YOUR SYSTEM
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role_name,   // ✅ FRONTEND WILL USE THIS
        role_id: user.role_id   // 🔥 THIS LINE IS MISSING IN YOUR SYSTEM
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};


/* ================================
   SIGNUP
================================ */
const generateTempId = () => {
  return "TEMP_" + Math.floor(100000 + Math.random() * 900000);
};

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const [[unverifiedRole]] = await pool.query(`
      SELECT id FROM roles WHERE role_name = 'UNVERIFIED'
    `);

    const [[status]] = await pool.query(`
      SELECT id FROM status_master
      WHERE status_type='USER_STATUS' AND status_value='ACTIVE'
    `);

    const uuid = crypto.randomUUID();

    await pool.query(`
      INSERT INTO users
      (uuid, college_assigned_id, email, password_hash, role_id, status_id)
      VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?)
    `, [
      uuid,
      generateTempId(),
      email,
      hashed,
      unverifiedRole.id,
      status.id
    ]);

    res.success(null, "Signup successful. Please request a role.");

  } catch (err) {
    res.error("Signup failed");
  }
};

module.exports = { login, signup };