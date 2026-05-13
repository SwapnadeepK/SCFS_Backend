const {
  getFeeStructures,
  insertFeeStructure,
} = require("../models/feeStructureModel.js");

/* =========================================
   GET ALL
========================================= */
const getFeeStructure = async (
  req,
  res
) => {
  try {
    const data =
      await getFeeStructures(
        req.query
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
        "Failed to fetch fee structures",
    });
  }
};

/* =========================================
   CREATE
========================================= */
const createFeeStructure =
  async (req, res) => {
    try {
      const {
        college_id,
        department_id,
        degree_id,
        semester_id,
        academic_year,
        amount,
        due_date,
      } = req.body;

      /* VALIDATION */
      if (
        !college_id ||
        !department_id ||
        !degree_id ||
        !semester_id ||
        !academic_year ||
        !amount ||
        !due_date
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "All fields are required",
          });
      }

      const result =
        await insertFeeStructure({
          college_id,
          department_id,
          degree_id,
          semester_id,
          academic_year,
          amount,
          due_date,
        });

      res.status(201).json({
        success: true,
        message:
          "Fee structure created successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create fee structure",
      });
    }
  };

module.exports = {
  getFeeStructure,
  createFeeStructure,
};