// backend/utils/scheduler.js
const schedule = require("node-schedule");

const reauthenticateUser = (callback) => {
    schedule.scheduleJob("*/1 * * * *", () => {
        console.log("🔁 Reauthenticating user every 5 minutes...");
        callback();
    });
};

module.exports = { reauthenticateUser };
