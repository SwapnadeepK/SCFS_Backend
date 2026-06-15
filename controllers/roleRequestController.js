const { pool } = require("../config/db");

/* ================================
   USER → REQUEST ROLE
================================ */
const requestRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roleId } = req.body;

    const [[existing]] = await pool.query(`
  SELECT id FROM role_requests
  WHERE user_id = ?
  AND approval_status_id = (
    SELECT id FROM status_master
    WHERE status_type='APPROVAL_STATUS'
    AND status_value='PENDING'
  )
`, [userId]);

if (existing) {
  return res.error("You already have a pending request");
}

    await pool.query(`
      INSERT INTO role_requests (user_id, requested_role_id, approval_status_id)
      VALUES (?, ?, (
        SELECT id FROM status_master
        WHERE status_type='APPROVAL_STATUS'
        AND status_value='PENDING'
      ))
    `, [userId, roleId]);

    res.success(null, "Role request submitted");

  } catch (err) {
    console.error(err);
    res.error("Failed to submit role request");
  }
};


/* ================================
   ADMIN → GET PENDING + UNVERIFIED
================================ */
const getPendingRoleRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
    rr.id AS request_id,
    rr.created_at,

    u.id,
    u.email,

    up.full_name,

    r.role_name,
    r2.role_name AS requested_role,

    rr.requested_role_id,

    sm.status_value AS status

FROM role_requests rr

JOIN users u
    ON u.id = rr.user_id

LEFT JOIN user_profiles up
    ON up.user_id = u.id

JOIN roles r
    ON r.id = u.role_id

LEFT JOIN roles r2
    ON r2.id = rr.requested_role_id

LEFT JOIN status_master sm
    ON sm.id = rr.approval_status_id

ORDER BY rr.created_at DESC;
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch role requests"
    });
  }
};


/* ================================
   ADMIN → APPROVE REQUEST
================================ */
const approveRoleRequest = async (req, res) => {
  try {
    const { request_id, user_id, role_id } = req.body;

    // ✅ Get APPROVED status id
    const [[approvedStatus]] = await pool.query(`
      SELECT id FROM status_master
      WHERE status_type='APPROVAL_STATUS'
      AND status_value='APPROVED'
    `);

    // ✅ Update user role
    await pool.query(`
      UPDATE users SET role_id = ?
      WHERE id = ?
    `, [role_id, user_id]);

    // ✅ Update request status
    await pool.query(`
      UPDATE role_requests
      SET approval_status_id = ?
      WHERE id = ?
    `, [approvedStatus.id, request_id]);

    res.json({ message: "Role approved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
};


/* ================================
   ADMIN → REJECT REQUEST
================================ */
const rejectRoleRequest = async (req, res) => {
  try {
    const { request_id } = req.body;

    // ✅ Get REJECTED status id
    const [[rejectedStatus]] = await pool.query(`
      SELECT id FROM status_master
      WHERE status_type='APPROVAL_STATUS'
      AND status_value='REJECTED'
    `);

    await pool.query(`
      UPDATE role_requests
      SET approval_status_id = ?
      WHERE id = ?
    `, [rejectedStatus.id, request_id]);

    res.json({ message: "Role request rejected" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Rejection failed" });
  }
};

const getMyRoleRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(`
      SELECT rr.id, sm.status_value
      FROM role_requests rr
      JOIN status_master sm ON sm.id = rr.approval_status_id
      WHERE rr.user_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: rows,
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch your request",
    });
  }
};


module.exports = {
  requestRole,
  getPendingRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  getMyRoleRequest
};