const { pool } = require("../config/db");

/* =========================================
   GET ALL FEE STRUCTURES
========================================= */
const getFeeStructures =
  async () => {
    const [rows] =
      await pool.query(`
        SELECT
          fs.id,

          c.college_name,

          d.department_name,

          dg.degree_name,

          s.semester_name,

          fs.academic_year,

          fs.amount,

          fs.due_date

        FROM fee_structures fs

        JOIN colleges c
          ON fs.college_id = c.id

        JOIN departments d
          ON fs.department_id = d.id

        JOIN degrees dg
          ON fs.degree_id = dg.id

        JOIN semesters s
          ON fs.semester_id = s.id

        ORDER BY fs.id DESC
      `);

    return rows;
  };

/* =========================================
   INSERT
========================================= */
const insertFeeStructure =
  async ({
    college_id,
    department_id,
    degree_id,
    semester_id,
    academic_year,
    amount,
    due_date,
  }) => {
    const [result] =
      await pool.query(
        `
        INSERT INTO fee_structures (
          uuid,
          college_id,
          department_id,
          degree_id,
          semester_id,
          academic_year,
          amount,
          due_date
        )
        VALUES (
          UUID_TO_BIN(UUID()),
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `,
        [
          college_id,
          department_id,
          degree_id,
          semester_id,
          academic_year,
          amount,
          due_date,
        ]
      );

    return result;
  };

module.exports = {
  getFeeStructures,
  insertFeeStructure,
};