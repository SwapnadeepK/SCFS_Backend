const userModel = require("../models/userModel.js");
const { changeUserPassword } = require("../services/userService.js");
const { pool } = require("../config/db");

const getUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();

        res.json({
            success: true,
            data: users
        });

    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

const searchUsers = async (req, res) => {
    const { name, email } = req.query;

    const users = await userModel.searchUsers(name, email);
    res.json({
        success: true,
        data: users
    });
};

const changePassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.error("Email and new password are required", 400);
    }

    await changeUserPassword(email, newPassword);

    res.success(null, "Password updated successfully");
};

const checkProfileCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // 1️⃣ Base profile
    const [[profile]] = await pool.query(
      `SELECT id FROM user_profiles WHERE user_id = ?`,
      [userId]
    );

    if (!profile) {
      return res.json({
        complete: false,
        next: "/complete-profile",
        missing: "USER_PROFILE",
      });
    }

    // 2️⃣ Student check
    if (role === "STUDENT") {
      const [[student]] = await pool.query(
        `SELECT id FROM student_details WHERE user_id = ?`,
        [userId]
      );

      if (!student) {
        return res.json({
          complete: false,
          next: "/complete-profile",
          missing: "STUDENT_DETAILS",
        });
      }
    }

    // 3️⃣ Staff check
    if (role === "PROFESSOR" || role === "PRINCIPAL") {
      const [[staff]] = await pool.query(
        `SELECT id FROM staff_details WHERE user_id = ?`,
        [userId]
      );

      if (!staff) {
        return res.json({
          complete: false,
          next: "/complete-profile",
          missing: "STAFF_DETAILS",
        });
      }
    }

    return res.json({
      complete: true,
      next: "/dashboard",
    });

  } catch (err) {
    res.status(500).json({ message: "Profile check failed" });
  }
};

/* ================= PROFILE STATUS ================= */
const getProfileStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get base role from users table (SOURCE OF TRUTH)
    const [[user]] = await pool.query(
  `SELECT r.role_name AS role
   FROM users u
   JOIN roles r ON r.id = u.role_id
   WHERE u.id = ?`,
  [userId]
);

    const role = user?.role || "UNKNOWN";

    // 2. Check profile
    const [[profile]] = await pool.query(
      `SELECT id FROM user_profiles WHERE user_id = ?`,
      [userId]
    );

    if (!profile) {
      return res.json({
        complete: false,
        step: 1,
        role,
      });
    }

    // 3. Role-specific validation
    if (role === "STUDENT") {
      const [[student]] = await pool.query(
        `SELECT id FROM student_details WHERE user_id = ?`,
        [userId]
      );

      if (!student) {
        return res.json({
          complete: false,
          step: 2,
          role,
          type: "STUDENT",
        });
      }
    }

    if (["PROFESSOR", "PRINCIPAL", "STAFF"].includes(role)) {
      const [[staff]] = await pool.query(
        `SELECT id FROM staff_details WHERE user_id = ?`,
        [userId]
      );

      if (!staff) {
        return res.json({
          complete: false,
          step: 2,
          role,
          type: "STAFF",
        });
      }
    }

    // 4. Fully complete
    return res.json({
      complete: true,
      role,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile check failed" });
  }
};

/* ================= COMPLETE PROFILE ================= */
const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const data = req.body;

    // STEP 1: user_profiles
    await pool.query(`
      INSERT INTO user_profiles 
      (user_id, full_name, dob, phone, address, gender, aadhar_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      phone = VALUES(phone),
      address = VALUES(address)
    `, [
      userId,
      data.full_name,
      data.dob,
      data.phone,
      data.address,
      data.gender,
      data.aadhar_number
    ]);

    // STEP 2: STUDENT
    if (role === "STUDENT") {
      await pool.query(`
        INSERT INTO student_details 
        (user_id, college_id, department_id, degree_id, semester_id, batch_year, usn, approval_status_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE usn = VALUES(usn)
      `, [
        userId,
        data.college_id,
        data.department_id,
        data.degree_id,
        data.semester_id,
        data.batch_year,
        data.usn
      ]);
    }

    // STEP 3: STAFF
    if (role === "PROFESSOR" || role === "PRINCIPAL") {
      await pool.query(`
        INSERT INTO staff_details 
        (user_id, college_id, department_id, designation, approval_status_id)
        VALUES (?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE designation = VALUES(designation)
      `, [
        userId,
        data.college_id,
        data.department_id,
        data.designation
      ]);
    }

    res.json({ message: "Profile completed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile save failed" });
  }
};

module.exports = { getUsers, searchUsers, changePassword, checkProfileCompletion, completeProfile, getProfileStatus };