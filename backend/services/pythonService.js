const { spawn } = require("child_process");
const path = require("path");

// Run the Python voice authentication or enrollment script
const runPythonAuth = (mode, username, voiceFilePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, "../../python_core/voice_authentication.py");

    const process = spawn("python", [pythonScript, mode, username, voiceFilePath]);

    let result = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      result += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error(`[PYTHON STDERR]: ${data}`);
    });

    process.on("error", (err) => {
      return reject({
        success: false,
        output: `Failed to start subprocess: ${err.message}`,
      });
    });

    process.on("close", (code) => {
      const finalOutput = result.trim();
      if (code === 0) {
        resolve({
          success: true,
          output: finalOutput,
        });
      } else {
        resolve({
          success: false,
          output: finalOutput || errorOutput,
        });
      }
    });
  });
};

// Run the Python monitoring SLM engine
const runPythonMonitor = () => {
  return new Promise((resolve, reject) => {
    const monitorPath = path.join(__dirname, "../../python_core/slm_engine.py");

    const process = spawn("python", [monitorPath]);

    let summary = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      summary += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error(`[PYTHON MONITOR STDERR]: ${data}`);
    });

    process.on("error", (err) => {
      return reject({
        success: false,
        output: `Failed to run Python script: ${err.message}`,
      });
    });

    process.on("close", (code) => {
      const finalSummary = summary.trim();
      if (code === 0) {
        resolve({
          success: true,
          output: finalSummary,
        });
      } else {
        resolve({
          success: false,
          output: finalSummary || errorOutput,
        });
      }
    });
  });
};

module.exports = {
  runPythonAuth,
  runPythonMonitor,
};
