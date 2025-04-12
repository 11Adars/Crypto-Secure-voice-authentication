const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const cors = require("cors");

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Replaces bodyParser
app.use("/uploads", express.static("uploads")); // Optional: serve uploaded audio

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

module.exports = app;
