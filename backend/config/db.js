// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://adarshapoojary826:Adarsh123@cluster0.f9kxuqx.mongodb.net/crypto?retryWrites=true&w=majority&appName=Cluster0", {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
