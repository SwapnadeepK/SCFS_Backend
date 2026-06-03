const {
  getStudentFees,
} = require("../models/studentFeeModel");

/* =========================================
   GET MY FEES
========================================= */
const getMyFees = async (
  req,
  res
) => {
  try {
    const { studentId } = req.params;

    const data =
      await getStudentFees(
        studentId
      );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch student fees",
    });
  }
};

module.exports = {
  getMyFees,
};