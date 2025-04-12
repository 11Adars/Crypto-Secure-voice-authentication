// backend/utils/scheduler.js
const schedule = require("node-schedule");

const reauthenticateUser = (callback) => {
    schedule.scheduleJob("*/5 * * * *", () => {
        console.log("🔁 Reauthenticating user every 5 minutes...");
        callback();
    });
};

module.exports = { reauthenticateUser };
