const {
  createPaymentRequest,
  getPendingPayments,
  approvePayment,
} = require("../models/feePaymentModel");

/* =========================================
   CREATE PAYMENT
========================================= */
const createPayment =
  async (req, res) => {
    try {

      const {
        student_id,
        fee_structure_id,
        transaction_id,
        payment_method,
      } = req.body;

      /* =====================================
         VALIDATION
      ===================================== */
      if (
        !student_id ||
        !fee_structure_id ||
        !transaction_id ||
        !payment_method
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All fields are required",
        });
      }

      /* =====================================
         CREATE PAYMENT
      ===================================== */
      const result =
        await createPaymentRequest({
          student_id,
          fee_structure_id,
          transaction_id,
          payment_method,
        });

      return res.status(201).json({
        success: true,
        message:
          "Payment submitted successfully",
        data: result,
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        success: false,
        message:
          err.message ||
          "Failed to submit payment",
      });
    }
  };

/* =========================================
   GET ALL PENDING APPROVALS
========================================= */
const getApprovals =
  async (req, res) => {
    try {

      const rows =
        await getPendingPayments();

      return res.json({
        success: true,
        data: rows,
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch approvals",
      });
    }
  };

/* =========================================
   APPROVE / REJECT PAYMENT
========================================= */
const approve =
  async (req, res) => {
    try {

      const feeId =
        req.params.id;

      const {
        status_id,
      } = req.body;

      if (!status_id) {
        return res.status(400).json({
          success: false,
          message:
            "status_id is required",
        });
      }

      await approvePayment(
        feeId,
        status_id
      );

      return res.json({
        success: true,
        message:
          "Payment updated successfully",
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        success: false,
        message:
          "Failed to update payment",
      });
    }
  };

module.exports = {
  createPayment,
  getApprovals,
  approve,
};