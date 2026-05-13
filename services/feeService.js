const { getAllFees, createFeeTransaction } = require("../models/feeModel.js");
const { generateUUID } = require("../utils/uuid.js");
const { pool } = require("../config/db.js");

const getFeesService = async () => {
    return await getAllFees();
};

const payFeeService = async (data) => {
    const {
        fee_id,
        student_id,
        amount,
        payment_method
    } = data;

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
        await conn.query(`
            INSERT INTO fee_transactions 
            (uuid, fee_id, student_id, transaction_ref, amount, payment_method, payment_status_id, paid_at)
            VALUES (
                UUID_TO_BIN(?),
                ?, ?, ?, ?, ?, 
                (SELECT id FROM status_master WHERE status_type='PAYMENT_STATUS' AND status_value='SUCCESS'),
                NOW()
            )
        `, [
            generateUUID(),
            fee_id,
            student_id,
            `TXN_${Date.now()}`,
            amount,
            payment_method
        ]);

        await conn.query(`
            UPDATE fees
            SET fee_status_id = (
                SELECT id FROM status_master 
                WHERE status_type='FEE_STATUS' AND status_value='PAID'
            )
            WHERE id = ?
        `, [fee_id]);

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
const getMyFeesService = async (userId) => {

  /* =====================================
     GET STUDENT DETAILS
  ===================================== */
  const [studentRows] = await pool.query(
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
    throw new Error("Student profile not found");
  }

  const student = studentRows[0];

  /* =====================================
     GET ALL APPLICABLE FEE STRUCTURES
  ===================================== */
  const [feeStructures] = await pool.query(
    `
    SELECT
      fs.id,
      fs.amount,
      fs.due_date,

      c.college_name,
      d.department_name,
      deg.degree_name,
      sem.semester_name

    FROM fee_structures fs

    LEFT JOIN colleges c
      ON c.id = fs.college_id

    LEFT JOIN departments d
      ON d.id = fs.department_id

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
     DEFAULT STATUS IDS
  ===================================== */

  // PAYMENT_STATUS -> PENDING
  const [pendingPaymentStatus] = await pool.query(
    `
    SELECT id
    FROM status_master
    WHERE status_type = 'PAYMENT_STATUS'
      AND status_value = 'PENDING'
    LIMIT 1
    `
  );

  // APPROVAL_STATUS -> PENDING
  const [pendingApprovalStatus] = await pool.query(
    `
    SELECT id
    FROM status_master
    WHERE status_type = 'APPROVAL_STATUS'
      AND status_value = 'PENDING'
    LIMIT 1
    `
  );

  const paymentStatusId =
    pendingPaymentStatus[0]?.id;

  const approvalStatusId =
    pendingApprovalStatus[0]?.id;

  /* =====================================
     AUTO-CREATE FEES IF NOT EXISTS
  ===================================== */
  for (const fs of feeStructures) {

    const [existingFee] = await pool.query(
      `
      SELECT id
      FROM fees
      WHERE student_id = ?
        AND fee_structure_id = ?
      `,
      [userId, fs.id]
    );

    if (!existingFee.length) {

      const feesId =
        `FEE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await pool.query(
        `
        INSERT INTO fees (
          uuid,
          fees_id,
          student_id,
          fee_structure_id,
          fee_status_id,
          approval_status_id
        )
        VALUES (
          UUID_TO_BIN(UUID()),
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
          paymentStatusId,
          approvalStatusId,
        ]
      );
    }
  }

  /* =====================================
     RETURN FINAL FEES DATA
  ===================================== */
  const [rows] = await pool.query(
    `
    SELECT
      f.id,
      f.fees_id,

      fs.amount,
      fs.due_date,

      sm1.status_value AS fee_status,
      sm2.status_value AS approval_status,

      ft.transaction_ref,
      ft.payment_method,
      ft.paid_at,

      c.college_name,
      d.department_name,
      deg.degree_name,
      sem.semester_name

    FROM fees f

    JOIN fee_structures fs
      ON fs.id = f.fee_structure_id

    JOIN student_details s
      ON s.user_id = f.student_id

    LEFT JOIN colleges c
      ON c.id = s.college_id

    LEFT JOIN departments d
      ON d.id = s.department_id

    LEFT JOIN degrees deg
      ON deg.id = s.degree_id

    LEFT JOIN semesters sem
      ON sem.id = s.semester_id

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
const getPendingFeeApprovalsService = async () => {

    const [rows] = await pool.query(`
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
    `);

  return rows;
};

/* =========================================
   ADMIN -> APPROVE PAYMENT
========================================= */
const approveFeePaymentService = async ({
  fee_id,
  admin_id,
}) => {

  const APPROVED_STATUS_ID = 2;

  await pool.query(`
    UPDATE fees
    SET
      approval_status_id = ?,
      approved_by = ?,
      approved_at = NOW()
    WHERE id = ?
  `, [
    APPROVED_STATUS_ID,
    admin_id,
    fee_id,
  ]);
};


module.exports = {
    getFeesService,
    payFeeService,
    getMyFeesService,
    getPendingFeeApprovalsService,
    approveFeePaymentService
};