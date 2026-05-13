const express = require("express");
const router = express.Router();

const { pool } = require("../config/db.js");
const { authenticate } = require("../middleware/authMiddleware.js");

// Get logged-in user's notifications
router.get("/", authenticate, async (req, res) => {
    const [rows] = await pool.query(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
        [req.user.id]
    );

    res.json(rows);
});

// Mark notification as read
router.put("/:id/read", authenticate, async (req, res) => {
    await pool.query(
        "UPDATE notifications SET is_read = TRUE WHERE id = ?",
        [req.params.id]
    );

    res.json({ message: "Notification marked as read" });
});

// Admin: send notification manually
router.post("/", authenticate, async (req, res) => {
    const { user_id, message } = req.body;

    await pool.query(
        "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
        [user_id, message]
    );

    res.json({ message: "Notification sent" });
});

module.exports = router;