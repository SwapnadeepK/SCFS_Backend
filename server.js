const app = require("./app.js");
const { processQueue } = require("./services/notificationQueue.js");

const PORT = process.env.PORT || 5000;

processQueue(); // Start processing the notification queue

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    server.close(() => {
        process.exit(0);
    });
});