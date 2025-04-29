const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const accessFile = async (req, res) => {
  try {
    res.status(200).json({ content: "Confidential file accessed!" });
  } catch (err) {
    res.status(500).json({ error: "Access failed" });
  }
};

const startMonitoring = async (req, res) => {
  try {
    const { action, username = "unknown" } = req.body;
    const logPath = path.join(__dirname, "../logs/alerts.log");
    fs.mkdirSync(path.dirname(logPath), { recursive: true });

    // Store timestamp in UTC
    const timestamp = new Date().toISOString(); // ISO format in UTC
    const logEntry = `${timestamp} - ${action} - /confidential.txt\n`;
    fs.appendFileSync(logPath, logEntry);

    res.status(200).json({ message: "Threat logged" });
  } catch (err) {
    console.error("Logging error:", err);
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
  const scriptPath = path.join(__dirname, "../../python_core/slm_engine.py");

  try {
    const pythonProcess = spawn(
      process.platform === "win32" ? "python" : "python",
      [scriptPath]
    );

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      const text = data.toString();
      console.log("[Python STDOUT]:", text);
      output += text;
    });
    
    pythonProcess.stderr.on("data", (data) => {
      const text = data.toString();
      console.warn("[Python STDERR]:", text);
      errorOutput += text;
    });
    

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script failed:", errorOutput);
        return res.status(500).json({ error: errorOutput || "Unknown error from log summarizer" });
      }
      return res.status(200).json({ summary: output });
    });
  } catch (err) {
    res.status(500).json({ error: "Error running log summarizer" });
  }
};

module.exports = {
  accessFile,
  startMonitoring,
  getAlerts,
  getLogs,
};