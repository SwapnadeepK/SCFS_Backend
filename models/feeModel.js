const { pool } = require("../config/db.js");

const getAllFees = async (params) => {
  let {
    search = "",
    status = "",
    sortBy = "date",
    order = "ASC",
    page = 0,
    limit = 10,
  } = params;

  page = parseInt(page);
  limit = parseInt(limit);
  const offset = page * limit;

  let query = `
    SELECT 
      f.id,
      u.email,
      fs.amount,
      f.fee_status_id,
      f.submitted_at
    FROM fees f
    JOIN users u ON f.student_id = u.id
    JOIN fee_structures fs ON f.fee_structure_id = fs.id
    WHERE 1=1
  `;

  let countQuery = `
    SELECT COUNT(*) as total
    FROM fees f
    JOIN users u ON f.student_id = u.id
    JOIN fee_structures fs ON f.fee_structure_id = fs.id
    WHERE 1=1
  `;

  let values = [];

  // 🔍 SEARCH
  if (search) {
    query += " AND u.email LIKE ?";
    countQuery += " AND u.email LIKE ?";
    values.push(`%${search}%`);
  }

  // 📌 STATUS FILTER
  if (status) {
    query += " AND f.fee_status_id = ?";
    countQuery += " AND f.fee_status_id = ?";
    values.push(status);
  }

  // ✅ SAFE SORTING (FIXED)
  const validColumns = {
    amount: "fs.amount",
    date: "f.submitted_at",
    email: "u.email",
  };

  const sortColumn = validColumns[sortBy] || "f.submitted_at";
  const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

  query += ` ORDER BY ${sortColumn} ${sortOrder}`;
  query += " LIMIT ? OFFSET ?";

  values.push(limit, offset);

  const [rows] = await pool.query(query, values);

  const countValues = values.slice(0, values.length - 2);
  const [countResult] = await pool.query(countQuery, countValues);

  return {
    data: rows,
    total: countResult[0].total,
  };
};

const createFeeTransaction = async (data) => {
    const {
        uuid,
        fee_id,
        student_id,
        transaction_ref,
        amount,
        payment_method,
        payment_status_id
    } = data;

    await pool.query(`
        INSERT INTO fee_transactions 
        (uuid, fee_id, student_id, transaction_ref, amount, payment_method, payment_status_id)
        VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)
    `, [uuid, fee_id, student_id, transaction_ref, amount, payment_method, payment_status_id]);
};

const getFeeReports = async (filters) => {
  const { academic_year, semester_id } = filters;
   const departmentStats = await getDepartmentStats(filters);

  let where = "WHERE 1=1";
  let values = [];

  if (academic_year) {
    where += " AND f.academic_year = ?";
    values.push(academic_year);
  }

  if (semester_id) {
    where += " AND fs.semester_id = ?";
    values.push(semester_id);
  }

  // 📊 SUMMARY
  const [summary] = await pool.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN f.fee_status_id = 2 THEN 1 ELSE 0 END) as paid,
      SUM(CASE WHEN f.fee_status_id != 2 THEN 1 ELSE 0 END) as pending
    FROM fees f
    JOIN fee_structures fs ON f.fee_structure_id = fs.id
    ${where}
  `, values);

  // 📈 REVENUE TREND
  const [monthlyRevenue] = await pool.query(`
    SELECT 
      DATE_FORMAT(f.submitted_at, '%Y-%m') as month,
      SUM(fs.amount) as revenue
    FROM fees f
    JOIN fee_structures fs ON f.fee_structure_id = fs.id
    ${where} AND f.fee_status_id = 2
    GROUP BY month
    ORDER BY month ASC
  `, values);

  // 📊 PAYMENT COUNT TREND (NEW)
  const [paymentTrend] = await pool.query(`
    SELECT 
      DATE_FORMAT(f.submitted_at, '%Y-%m') as month,
      COUNT(*) as count
    FROM fees f
    JOIN fee_structures fs ON f.fee_structure_id = fs.id
    ${where}
    GROUP BY month
    ORDER BY month ASC
  `, values);

  return {
    summary: summary[0],
    monthlyRevenue,
    paymentTrend,
    departmentStats // 👈 NEW
  };
};

const getDepartmentStats = async (filters) => {
  const { academic_year = "", semester_id = "" } = filters;

  let query = `
    SELECT 
      d.department_name AS department,
      COUNT(DISTINCT f.id) AS total,
      SUM(CASE WHEN f.fee_status_id = 2 THEN 1 ELSE 0 END) AS paid,
      SUM(CASE WHEN f.fee_status_id = 1 THEN 1 ELSE 0 END) AS pending,
      SUM(fs.amount) AS revenue
    FROM fees f
    JOIN student_details sd ON f.student_id = sd.user_id
    JOIN departments d ON sd.department_id = d.id
    JOIN fee_structures fs ON f.fee_structure_id = fs.id
    WHERE 1=1
  `;

  const values = [];

  // ✅ FILTERS
  if (academic_year) {
    query += " AND f.academic_year = ?";
    values.push(academic_year);
  }

  if (semester_id) {
    query += " AND fs.semester_id = ?";
    values.push(semester_id);
  }

  // ✅ ADD ONLY ONCE (NO SEMICOLON ❌)
  query += `
    GROUP BY d.department_name
    ORDER BY revenue DESC
  `;

  const [rows] = await pool.query(query, values);

  return rows;
};

module.exports = {
    getAllFees,
    createFeeTransaction,
    getFeeReports
};