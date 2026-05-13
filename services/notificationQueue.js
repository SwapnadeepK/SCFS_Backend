const queue = [];

const addToQueue = (job) => {
    queue.push(job);
};

const processQueue = async () => {
    while (true) {
        if (queue.length > 0) {
            const job = queue.shift();
            await jobHandler(job);
        }

        await new Promise(res => setTimeout(res, 1000));
    }
};

const jobHandler = async (job) => {
    const { sendNotification } = require("./notificationService.js");

    await sendNotification(job.userId, job.message);
};

module.exports = { addToQueue, processQueue };