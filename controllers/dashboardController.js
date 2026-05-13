const { pool } = require("../config/db");

const getAdminDashboard = async (req, res) => {
  try {
    // 👤 Total users
    const [users] = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    // 💰 Total payments + revenue (FIXED TABLE)
    const [payments] = await pool.query(`
      SELECT 
        COUNT(*) AS totalPayments, 
        SUM(amount) AS totalRevenue 
      FROM fee_transactions
    `);

    // 📊 Revenue trend (last 7 entries)
    const [revenueTrend] = await pool.query(`
      SELECT 
        DATE(created_at) as date, 
        SUM(amount) as revenue
      FROM fee_transactions
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      LIMIT 7
    `);

    // 📊 Payment count trend
    const [paymentTrend] = await pool.query(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count
      FROM fee_transactions
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      LIMIT 7
    `);

    res.json({
      summary: {
        totalUsers: users[0].totalUsers,
        totalPayments: payments[0].totalPayments || 0,
        totalRevenue: payments[0].totalRevenue || 0,
      },
      revenueTrend,
      paymentTrend,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard failed" });
  }
};

module.exports = { getAdminDashboard };