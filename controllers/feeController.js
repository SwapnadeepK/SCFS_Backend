const { getAllFees, getFeeReports } = require("../models/feeModel.js");
const { payFeeService,  getMyFeesService,
  approveFeePaymentService,
  getPendingFeeApprovalsService, } = require("../services/feeService.js");

const payFee = async (req, res) => {
    await payFeeService(req.body);
    res.json({ message: "Payment successful" });
};

const getAllFeesController = async (req, res) => {
    try {
        const result = await getAllFees(req.query);

        res.json({
            data: result.data,
            total: result.total
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

const getReports = async (req, res) => {
  try {
    const data = await getFeeReports(req.query);
    //console.log("REPORT API HIT");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reports failed" });
  }
};

/* =========================================
   STUDENT -> MY FEES
========================================= */
const getMyFees = async (req, res) => {
  try {

    const data = await getMyFeesService(req.user.id);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch fees"
    });
  }
};

/* =========================================
   ADMIN -> PENDING APPROVALS
========================================= */
const getPendingFeeApprovals = async (req, res) => {
  try {

    const data =
      await getPendingFeeApprovalsService();

    res.json({
      success: true,
      data,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch approvals",
    });
  }
};

/* =========================================
   ADMIN -> APPROVE PAYMENT
========================================= */
const approveFeePayment = async (req, res) => {
  try {

    await approveFeePaymentService({
      fee_id: req.body.fee_id,
      admin_id: req.user.id,
    });

    res.json({
      success: true,
      message: "Payment approved",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Approval failed",
    });
  }
};

module.exports = {
    getAllFees: getAllFeesController,
    payFee,
    getReports,
     getMyFees,
  getPendingFeeApprovals,
  approveFeePayment,
};