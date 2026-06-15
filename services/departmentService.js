const { pool } =
  require("../config/db");

const getDepartmentsByCollegeService =
  async (collegeId) => {

    const [rows] =
      await pool.query(
        `
        SELECT
          id,
          department_code,
          department_name
        FROM departments
        WHERE college_id = ?
        ORDER BY department_name
        `,
        [collegeId]
      );

    return rows;
  };

module.exports = {
  getDepartmentsByCollegeService,
};