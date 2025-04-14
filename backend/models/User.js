// // backend/models/User.js
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     voiceId: { type: String, required: true, unique: true }
// });

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  voiceId: {
    type: String,
    required: true,
    unique: true
  },
  voiceSamplePath: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ voiceId: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);