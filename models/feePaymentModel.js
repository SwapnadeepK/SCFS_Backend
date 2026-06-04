const { pool } = require("../config/db");

/* =========================================
   CREATE PAYMENT REQUEST
========================================= */
const createPaymentRequest = async (data) => {

  const {
    student_id,
    fee_structure_id,
    transaction_id,
    payment_method,
  } = data;

  /* =====================================
     GET FEE STRUCTURE
  ===================================== */
  const [feeRows] = await pool.execute(
    `
    SELECT *
    FROM fee_structures
    WHERE id = ?
    `,
    [fee_structure_id]
  );

  if (feeRows.length === 0) {
    throw new Error(
      "Fee structure not found"
    );
  }

  const feeStructure = feeRows[0];

  /* =====================================
     FIND EXISTING FEE ENTRY
  ===================================== */
  const [existingFeeRows] =
    await pool.execute(
      `
      SELECT
        id,
        fee_status_id,
        approval_status_id
      FROM fees
      WHERE student_id = ?
        AND fee_structure_id = ?
      LIMIT 1
      `,
      [
        student_id,
        fee_structure_id,
      ]
    );

  if (
    existingFeeRows.length === 0
  ) {
    throw new Error(
      "Fee record not found for student"
    );
  }

  const feeId =
    existingFeeRows[0].id;

  /* =====================================
     PREVENT DUPLICATE PAYMENT
  ===================================== */
  const [existingTransactions] =
    await pool.execute(
      `
      SELECT id
      FROM fee_transactions
      WHERE fee_id = ?
      LIMIT 1
      `,
      [feeId]
    );

  if (
    existingTransactions.length > 0
  ) {
    throw new Error(
      "Payment already submitted for this fee"
    );
  }

  /* =====================================
     PAYMENT STATUS ID
  ===================================== */
  const PAYMENT_PENDING_STATUS_ID = 12;

  /* =====================================
     CREATE TRANSACTION
  ===================================== */
  const [transactionResult] =
    await pool.execute(
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
        UUID_TO_BIN(UUID()),
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
        feeId,
        student_id,
        transaction_id,
        feeStructure.amount,
        payment_method,
        PAYMENT_PENDING_STATUS_ID,
      ]
    );

  /* =====================================
     UPDATE FEES STATUS
  ===================================== */
  const FEE_UNPAID_STATUS_ID = 9;
  const APPROVAL_PENDING_STATUS_ID = 5;

  await pool.execute(
    `
    UPDATE fees
    SET
      fee_status_id = ?,
      approval_status_id = ?
    WHERE id = ?
    `,
    [
      FEE_UNPAID_STATUS_ID,
      APPROVAL_PENDING_STATUS_ID,
      feeId,
    ]
  );

  return {
    success: true,
    fee_id: feeId,
    transaction_id:
      transactionResult.insertId,
  };
};

/* =========================================
   GET PENDING APPROVALS
========================================= */
const getPendingPayments =
  async () => {

    const sql = `
      SELECT
        ft.id,
        ft.transaction_ref,
        ft.amount,
        ft.payment_method,
        ft.paid_at,

        f.fees_id,
        f.academic_year,

        fs.amount AS fee_amount,

        u.email,
        up.full_name,

        sm.status_value AS payment_status

      FROM fee_transactions ft

      INNER JOIN fees f
        ON f.id = ft.fee_id

      INNER JOIN fee_structures fs
        ON fs.id = f.fee_structure_id

      INNER JOIN users u
        ON u.id = f.student_id

      LEFT JOIN user_profiles up
        ON up.user_id = u.id

      LEFT JOIN status_master sm
        ON sm.id = ft.payment_status_id

      WHERE sm.status_type = 'PAYMENT_STATUS'
        AND sm.status_value = 'PENDING'

      ORDER BY ft.paid_at DESC
    `;

    const [rows] =
      await pool.execute(sql);

    return rows;
  };

/* =========================================
   APPROVE / REJECT PAYMENT
========================================= */
const approvePayment =
  async (
    transactionId,
    statusId
  ) => {

    /* =====================================
       UPDATE TRANSACTION STATUS
    ===================================== */
    await pool.execute(
      `
      UPDATE fee_transactions
      SET payment_status_id = ?
      WHERE id = ?
      `,
      [statusId, transactionId]
    );

    /* =====================================
       GET FEE ID
    ===================================== */
    const [transactionRows] =
      await pool.execute(
        `
        SELECT fee_id
        FROM fee_transactions
        WHERE id = ?
        `,
        [transactionId]
      );

    if (
      transactionRows.length === 0
    ) {
      throw new Error(
        "Transaction not found"
      );
    }

    const feeId =
      transactionRows[0].fee_id;

    /* =====================================
       UPDATE FEES TABLE
    ===================================== */
    let feeStatusId = 9; // UNPAID

    // APPROVED
    if (statusId === 13) {
      feeStatusId = 8; // PAID
    }

    await pool.execute(
      `
      UPDATE fees
      SET
        fee_status_id = ?,
        approval_status_id = ?
      WHERE id = ?
      `,
      [
        feeStatusId,
        statusId === 13 ? 6 : 5,
        feeId,
      ]
    );

    return true;
  };

module.exports = {
  createPaymentRequest,
  getPendingPayments,
  approvePayment,
};