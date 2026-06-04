const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Core Routes
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const feeRoutes = require("./routes/feeRoutes.js");

// Master / Core Data
const masterRoutes = require("./routes/masterRoutes.js");
const collegeRoutes = require("./routes/collegeRoutes.js");
const departmentRoutes = require("./routes/departmentRoutes.js");

// Student
const studentRoutes = require("./routes/studentRoutes.js");
const studentSelfRoutes = require("./routes/studentSelfRoutes.js");

// Fees
const feeStructureRoutes = require("./routes/feeStructureRoutes.js");

// Staff & Admin
const staffRoutes = require("./routes/staffRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

// NEW (Missing Modules)
const mappingRoutes = require("./routes/mappingRoutes.js");          // college-degree mapping
const reportRoutes = require("./routes/reportRoutes.js");            // reports
const approvalRoutes = require("./routes/approvalRoutes.js");        // approvals/rejections
const notificationRoutes = require("./routes/notificationRoutes.js");// notifications
const requestLogger = require("./middleware/requestLogger");         // request logging middleware
const roleRoutes = require("./routes/roleRoutes.js");                // role management routes
const dashboardRoutes = require("./routes/dashboardRoutes");     // dashboard routes
const roleRequestRoutes = require("./routes/roleRequestRoutes");  // role request routes
const profileRoutes = require("./routes/profileRoutes");  // profile completion check routes
const masterDataRoutes = require("./routes/masterDataRoutes.js");  // master data routes
const studentFeeRoutes = require("./routes/studentFeeRoutes");  // student fee structure routes
const feePaymentRoutes = require("./routes/feePaymentRoutes");  // fee payment routes
const receiptRoutes = require("./routes/receiptRoutes");  // receipt download routes

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(requestLogger);

//Extra Helmet Config for CSP (if needed)
app.use(helmet({
    contentSecurityPolicy: false
}));

//Response Formatter Middleware
app.use((req, res, next) => {
    res.success = (data, message = "Success") =>
        res.status(200).json({
            success: true,
            message,
            data
        });

    res.error = (message = "Error", status = 500) =>
        res.status(status).json({
            success: false,
            message
        });

    next();
});

// Health Check (VERY IMPORTANT)
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/fees", feeRoutes);

app.use("/api/master", masterRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/departments", departmentRoutes);

app.use("/api/students", studentRoutes);
app.use("/api/me", studentSelfRoutes);

app.use("/api/fee-structures", feeStructureRoutes);

app.use("/api/staff", staffRoutes);
app.use("/api/admin", adminRoutes);

// Newly Added Routes
app.use("/api/mappings", mappingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/role-requests", roleRequestRoutes);
app.use("/api/users/profile", profileRoutes);
app.use("/api/master", masterDataRoutes);
app.use("/api/student-fees", studentFeeRoutes);
app.use("/api/fee-payments", feePaymentRoutes);
app.use("/api/receipts", receiptRoutes);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
const errorHandler  = require("./middleware/errorMiddleware.js");   // middleware for error handling
app.use(errorHandler);

module.exports = app;