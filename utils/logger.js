const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Create logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Error logs
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error"
        }),

        // All logs
        new winston.transports.File({
            filename: path.join(logDir, "combined.log")
        })
    ]
});

// Console logging in development
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple()
        })
    );
}

module.exports = logger;