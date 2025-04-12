const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  registerUser,
  loginUser,
  voiceAuthenticate
} = require("../controllers/authController");

// Multer storage configuration for saving audio files in uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/")); // Ensures it points to /backend/uploads
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 👤 Register user with voice sample
router.post("/register", upload.single("audio"), registerUser);

// 🔐 Text-based login (if used)
router.post("/login", loginUser);

// 🎙️ Voice-based authentication
router.post("/voice-auth", upload.single("audio"), voiceAuthenticate);

module.exports = router;
