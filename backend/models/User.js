// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    voiceId: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("User", userSchema);
