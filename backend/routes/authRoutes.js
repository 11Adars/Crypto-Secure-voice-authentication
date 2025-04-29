

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  registerUser,
  loginUser,
  voiceAuthenticate
} = require("../controllers/authController");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit to 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/mpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only WAV/MP3 audio files are allowed'), false);
    }
  }
});

// Routes
router.post("/register", upload.single("audio"), registerUser);
router.post("/login", loginUser);
router.post("/voice-auth", upload.single("audio"), voiceAuthenticate);

module.exports = router;