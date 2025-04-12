const User = require("../models/User");
const path = require("path");
const { runPythonAuth } = require("../services/pythonService");

// ✅ REGISTER USER WITH VOICE
const registerUser = async (req, res) => {
  try {
    const username = req.body.username;
    const audioFile = req.file;

    if (!username || !audioFile) {
      return res.status(400).json({ success: false, error: "Username and voice file are required." });
    }

    const filePath = path.resolve(audioFile.path);

    const result = await runPythonAuth("enroll", username, filePath);

    if (result.success) {
      const newUser = new User({ username, voiceId: username });
      await newUser.save();
      console.log(`[INFO] Enrolled voice for user: ${username}`);
      res.status(201).json({ success: true, message: "✅ Voice registered successfully!" });
    } else {
      console.error(`[ERROR] Enrollment failed: ${result.output}`);
      res.status(500).json({ success: false, message: "❌ Voice enrollment failed.", output: result.output });
    }
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, error: "Server error during registration." });
  }
};

// ✅ BASIC LOGIN (Fetch user)
const loginUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, error: "Username is required." });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    res.status(200).json({ success: true, message: "✅ Login successful.", user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, error: "Server error during login." });
  }
};

// ✅ VOICE AUTHENTICATION
const voiceAuthenticate = async (req, res) => {
  try {
    const username = req.body.username;
    const audioFile = req.file;

    if (!username || !audioFile) {
      return res.status(400).json({ success: false, error: "Username and voice file are required." });
    }

    const filePath = path.resolve(audioFile.path);
    const result = await runPythonAuth("auth", username, filePath);

    console.log(`[INFO] Auth result for ${username}: ${result.output}`);

    if (result.success && result.output.includes("Access Granted")) {
      res.status(200).json({ success: true, message: "✅ Voice authentication successful!" });
    } else {
      res.status(401).json({ success: false, message: "❌ Voice authentication failed.", output: result.output });
    }
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ success: false, error: "Server error during authentication." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  voiceAuthenticate,
};
