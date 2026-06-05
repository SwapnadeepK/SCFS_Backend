const {
  getAllFees,
} = require("../models/feeModel.js");

const { generateUUID } =
  require("../utils/uuid.js");

const { pool } =
  require("../config/db.js");

/* =========================================
   GET ALL FEES
========================================= */
const getFeesService = async () => {
  return await getAllFees();
};

/* =========================================
   PAY FEE
========================================= */
const payFeeService = async (data) => {

  const {
    fee_id,
    student_id,
    amount,
    payment_method,
  } = data;

  const conn =
    await pool.getConnection();

  await conn.beginTransaction();

  try {

    /* =====================================
       PAYMENT STATUS ID
    ===================================== */
    const [paymentStatusRows] =
      await conn.query(
        `
        SELECT id
        FROM status_master
        WHERE status_type='PAYMENT_STATUS'
          AND status_value='SUCCESS'
        LIMIT 1
        `
      );

    const paymentStatusId =
      paymentStatusRows[0]?.id;

    if (!paymentStatusId) {
      throw new Error(
        "PAYMENT_STATUS SUCCESS not found"
      );
    }

    /* =====================================
       INSERT TRANSACTION
    ===================================== */
    await conn.query(
      `
      INSERT INTO fee_transactions (
        uuid,
        fee_id,
        student_id,
        transaction_ref,
        amount,
        payment_method,
        payment_status_id,
        paid_at
      )
      VALUES (
        UUID_TO_BIN(?),
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        NOW()
      )
      `,
      [
        generateUUID(),
        fee_id,
        student_id,
        `TXN_${Date.now()}`,
        amount,
        payment_method,
        paymentStatusId,
      ]
    );

    /* =====================================
       FEE STATUS -> PAID
    ===================================== */
    const [paidStatusRows] =
      await conn.query(
        `
        SELECT id
        FROM status_master
        WHERE status_type='FEE_STATUS'
          AND status_value='PAID'
        LIMIT 1
        `
      );

    const paidStatusId =
      paidStatusRows[0]?.id;

    if (!paidStatusId) {
      throw new Error(
        "FEE_STATUS PAID not found"
      );
    }

    await conn.query(
      `
      UPDATE fees
      SET fee_status_id = ?
      WHERE id = ?
      `,
      [paidStatusId, fee_id]
    );

    await conn.commit();

  } catch (err) {

    await conn.rollback();

    throw err;

  } finally {

    conn.release();
  }
};

/* =========================================
   STUDENT -> MY FEES
========================================= */
const getMyFeesService =
  async (userId) => {

  /* =====================================
     GET STUDENT DETAILS
  ===================================== */
  const [studentRows] =
    await pool.query(
      `
      SELECT
        college_id,
        department_id,
        degree_id,
        semester_id
      FROM student_details
      WHERE user_id = ?
      `,
      [userId]
    );

  if (!studentRows.length) {
    throw new Error(
      "Student profile not found"
    );
  }

  const student =
    studentRows[0];

  /* =====================================
     GET FEE STRUCTURES
  ===================================== */
  const [feeStructures] =
    await pool.query(
      `
      SELECT
        fs.id,
        fs.amount,
        fs.due_date,
        fs.academic_year,

        deg.degree_name,
        sem.semester_name

      FROM fee_structures fs

      LEFT JOIN degrees deg
        ON deg.id = fs.degree_id

      LEFT JOIN semesters sem
        ON sem.id = fs.semester_id

      WHERE fs.college_id = ?
        AND fs.department_id = ?
        AND fs.degree_id = ?
        AND fs.semester_id = ?
      `,
      [
        student.college_id,
        student.department_id,
        student.degree_id,
        student.semester_id,
      ]
    );

  /* =====================================
     GET STATUS IDS
  ===================================== */

  // FEE_STATUS -> PENDING
  const [feeStatusRows] = await pool.query(
  `
  SELECT id
  FROM status_master
  WHERE status_type = 'FEE_STATUS'
    AND status_value = 'UNPAID'
  LIMIT 1
  `
);

  // APPROVAL_STATUS -> PENDING
  const [approvalRows] =
    await pool.query(
      `
      SELECT id
      FROM status_master
      WHERE status_type='APPROVAL_STATUS'
        AND status_value='PENDING'
      LIMIT 1
      `
    );

  const feeStatusId =
    feeStatusRows[0]?.id;

  const approvalStatusId =
    approvalRows[0]?.id;

  if (!feeStatusId) {
    throw new Error(
  "FEE_STATUS UNPAID missing in status_master"
);
  }

  if (!feeStatusRows.length) {
    throw new Error(
      "APPROVAL_STATUS PENDING missing in status_master"
    );
  }

  /* =====================================
     AUTO CREATE FEES
  ===================================== */
  for (const fs of feeStructures) {

    const [existingFee] =
      await pool.query(
        `
        SELECT id
        FROM fees
        WHERE student_id = ?
          AND fee_structure_id = ?
        `,
        [userId, fs.id]
      );

    if (!existingFee.length) {

      const feesId = `DUP${Date.now().toString().slice(-7)}`;

      await pool.query(
        `
        INSERT INTO fees (
          uuid,
          fees_id,
          student_id,
          fee_structure_id,
          academic_year,
          fee_status_id,
          approval_status_id
        )
        VALUES (
          UUID_TO_BIN(UUID()),
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `,
        [
          feesId,
          userId,
          fs.id,
          fs.academic_year,
          feeStatusId,
          approvalStatusId,
        ]
      );
    }
  }

  /* =====================================
     RETURN FINAL DATA
  ===================================== */
  const [rows] =
    await pool.query(
      `
      SELECT
        f.id,
        f.fees_id,
        f.academic_year,

        fs.amount,
        fs.due_date,

        sm1.status_value AS fee_status,
        sm2.status_value AS approval_status,

        ft.transaction_ref,
        ft.payment_method,
        ft.paid_at,

        deg.degree_name,
        sem.semester_name

      FROM fees f

      JOIN fee_structures fs
        ON fs.id = f.fee_structure_id

      LEFT JOIN degrees deg
        ON deg.id = fs.degree_id

      LEFT JOIN semesters sem
        ON sem.id = fs.semester_id

      LEFT JOIN status_master sm1
        ON sm1.id = f.fee_status_id

      LEFT JOIN status_master sm2
        ON sm2.id = f.approval_status_id

      LEFT JOIN fee_transactions ft
        ON ft.fee_id = f.id

      WHERE f.student_id = ?

      ORDER BY f.submitted_at DESC
      `,
      [userId]
    );

  return rows;
};

/* =========================================
   ADMIN -> PENDING APPROVALS
========================================= */
const getPendingFeeApprovalsService =
  async () => {

  const [rows] =
    await pool.query(
      `
      SELECT
        f.id,
        f.fees_id,

        up.full_name,
        s.usn,

        fs.amount,

        ft.transaction_ref,
        ft.payment_method,
        ft.paid_at,

        sm.status_value AS approval_status

      FROM fees f

      JOIN user_profiles up
        ON up.user_id = f.student_id

      JOIN student_details s
        ON s.user_id = f.student_id

      JOIN fee_structures fs
        ON fs.id = f.fee_structure_id

      LEFT JOIN fee_transactions ft
        ON ft.fee_id = f.id

      LEFT JOIN status_master sm
        ON sm.id = f.approval_status_id

      ORDER BY ft.paid_at DESC
      `
    );

  return rows;
};

/* =========================================
   ADMIN -> APPROVE PAYMENT
========================================= */
const approveFeePaymentService =
  async ({
    fee_id,
    admin_id,
  }) => {

  const [approvedRows] =
    await pool.query(
      `
      SELECT id
      FROM status_master
      WHERE status_type='APPROVAL_STATUS'
        AND status_value='APPROVED'
      LIMIT 1
      `
    );

  const approvedStatusId =
    approvedRows[0]?.id;

  if (!approvedStatusId) {
    throw new Error(
      "APPROVAL_STATUS APPROVED missing"
    );
  }

  await pool.query(
    `
    UPDATE fees
    SET
      approval_status_id = ?,
      approved_by = ?,
      approved_at = NOW()
    WHERE id = ?
    `,
    [
      approvedStatusId,
      admin_id,
      fee_id,
    ]
  );
};

module.exports = {
  getFeesService,
  payFeeService,
  getMyFeesService,
  getPendingFeeApprovalsService,
  approveFeePaymentService,
};