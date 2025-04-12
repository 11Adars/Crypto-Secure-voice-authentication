const path = require("path");
const fs = require("fs");

const accessFile = async (req, res) => {
  try {
    // Dummy example
    res.status(200).json({ content: "Confidential file accessed!" });
  } catch (err) {
    res.status(500).json({ error: "Access failed" });
  }
};

const startMonitoring = async (req, res) => {
  try {
    const { action } = req.body;
    const logPath = path.join(__dirname, "../logs/alerts.log");

    fs.appendFileSync(logPath, `${new Date().toISOString()} - 🚨 ${action}\n`);
    res.status(200).json({ message: "Threat logged" });
  } catch (err) {
    res.status(500).json({ error: "Monitoring failed" });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alertPath = path.join(__dirname, "../logs/alerts.log");
    const alert = fs.existsSync(alertPath)
      ? fs.readFileSync(alertPath, "utf-8")
      : "No alerts.";
    res.status(200).json({ alert });
  } catch (err) {
    res.status(500).json({ error: "Error reading alerts" });
  }
};

const getLogs = async (req, res) => {
  try {
    const logPath = path.join(__dirname, "../logs/activity.log");
    const summary = fs.existsSync(logPath)
      ? fs.readFileSync(logPath, "utf-8")
      : "No logs.";
    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ error: "Error reading logs" });
  }
};

module.exports = {
  accessFile,
  startMonitoring,
 getAlerts,
  getLogs,
};
