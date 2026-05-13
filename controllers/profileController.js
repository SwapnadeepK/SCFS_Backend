const { pool } = require("../config/db");

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT 
  u.id AS user_id,

  r.role_name AS role,

  /* BASE PROFILE */
  up.full_name,
  up.dob,
  up.phone,
  up.address,
  up.gender,
  up.aadhar_number,
  up.photo_uri,

  /* STUDENT */
  s.usn,
  s.batch_year,

  s.college_id,
  c.college_name,

  s.department_id,
  d.department_name,

  s.degree_id,
  deg.degree_name,

  s.semester_id,
  sem.semester_name,

  /* STAFF */
  sd.college_id AS staff_college_id,
  sd.department_id AS staff_department_id,
  sd.designation AS staff_designation,

  /* ADMIN */
  ad.office_name,
  ad.designation AS admin_designation

FROM users u

JOIN roles r ON r.id = u.role_id

LEFT JOIN user_profiles up ON up.user_id = u.id

LEFT JOIN student_details s ON s.user_id = u.id
LEFT JOIN colleges c ON c.id = s.college_id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN degrees deg ON deg.id = s.degree_id
LEFT JOIN semesters sem ON sem.id = s.semester_id

LEFT JOIN staff_details sd ON sd.user_id = u.id
LEFT JOIN admin_details ad ON ad.user_id = u.id

WHERE u.id = ?
      `,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const data = rows[0];
    const role = data.role; // ✅ directly from DB

    if (!data.full_name) {
  return res.json({
    success: true,
    role: data.role,
    profile: null,
    roleData: null,
    message: "Profile not completed yet"
  });
}

    /* ---------------- CLEAN RESPONSE ---------------- */
    const response = {
      role,

      profile: {
        full_name: data.full_name,
        dob: data.dob,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
        aadhar_number: data.aadhar_number,
        photo_uri: data.photo_uri,
      },

      roleData: {},
    };

    /* ---------------- ROLE-BASED STRUCTURE ---------------- */

    if (role === "STUDENT") {
      response.roleData = {
        usn: data.usn,
        batch_year: data.batch_year,
        college: data.college_name,
        department: data.department_name,
        degree: data.degree_name,
        semester: data.semester_name,
      };
    }

    if (role === "PROFESSOR" || role === "PRINCIPAL") {
      response.roleData = {
        designation: data.staff_designation,
        college: data.college_name,
        department: data.department_name,
      };
    }

    if (role === "VTU_ADMIN") {
      response.roleData = {
        office_name: data.office_name,
        designation: data.admin_designation,
      };
    }

    return res.json({
      success: true,
      ...response,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

module.exports = { getMyProfile };