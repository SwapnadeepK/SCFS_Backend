const {pool} = require("../config/db");

const getStudentFees = async (userId) => {

  const sql = `
    SELECT
      fs.id,
      fs.amount,
      fs.academic_year,
      fs.due_date,

      c.college_name,
      d.department_name,
      dg.degree_name,
      s.semester_name,

      f.id AS fee_id,

      sm.status_value AS payment_status

    FROM student_details sd

    INNER JOIN fee_structures fs
      ON fs.college_id = sd.college_id
      AND fs.department_id = sd.department_id
      AND fs.degree_id = sd.degree_id
      AND fs.semester_id = sd.semester_id
      AND fs.academic_year = sd.batch_year

    INNER JOIN colleges c
      ON c.id = fs.college_id

    INNER JOIN departments d
      ON d.id = fs.department_id

    INNER JOIN degrees dg
      ON dg.id = fs.degree_id

    INNER JOIN semesters s
      ON s.id = fs.semester_id

    LEFT JOIN fees f
      ON f.student_id = sd.user_id
      AND f.fee_structure_id = fs.id

    LEFT JOIN status_master sm
      ON sm.id = f.fee_status_id

    WHERE sd.user_id = ?

    ORDER BY fs.due_date ASC
  `;

  const [rows] = await pool.query(sql, [userId]);

  return rows;
};

module.exports = {
  getStudentFees,
};