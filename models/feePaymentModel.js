const pool = require("../config/db");

/* =========================================
   CREATE PAYMENT REQUEST
========================================= */
const createPaymentRequest =
  async (data) => {

    const {
      student_id,
      fee_structure_id,
      transaction_id,
      payment_method,
    } = data;

    /* =====================================
       GET FEE STRUCTURE
    ===================================== */
    const [feeRows] =
      await pool.execute(
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

    const feeStructure =
      feeRows[0];

    /* =====================================
       CREATE FEES ENTRY
    ===================================== */

    const generatedFeeId =
      `FEE-${Date.now()}`;

    const [feeResult] =
      await pool.execute(
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
          generatedFeeId,
          student_id,
          fee_structure_id,
          feeStructure.academic_year,

          /* =================================
             STATUS IDS
          ================================= */

          12, // PAYMENT_PENDING
          5,  // APPROVAL_PENDING
        ]
      );

    const feeId =
      feeResult.insertId;

    /* =====================================
       CREATE TRANSACTION
    ===================================== */

    const [transactionResult] =
      await pool.execute(
        `
        INSERT INTO fee_transactions (
          fee_id,
          transaction_ref,
          amount,
          payment_method,
          payment_date,
          status_id
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          NOW(),
          ?
        )
        `,
        [
          feeId,
          transaction_id,
          feeStructure.amount,
          payment_method,

          5, // Pending Approval
        ]
      );

    return {
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
        ft.payment_date,

        f.fees_id,
        f.academic_year,

        fs.amount AS fee_amount,

        u.email,

        up.full_name,

        sm.status_value

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
        ON sm.id = ft.status_id

      WHERE sm.status_value = 'Pending'

      ORDER BY ft.payment_date DESC
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
      SET status_id = ?
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

    let feeStatusId = 12;

    // APPROVED
    if (statusId === 6) {
      feeStatusId = 13;
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
        statusId,
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