const express = require("express");
const router = express.Router();
const {
  accessFile,
  getAlerts,
  getLogs,
  startMonitoring
} = require("../controllers/fileController");

// Route to access a file
router.post("/access", accessFile);

// Route to start monitoring activity
router.post("/monitor", startMonitoring); // changed from GET to POST

// Route to fetch alerts
router.get("/alerts", getAlerts);

// Route to fetch logs
router.get("/logs", getLogs);

module.exports = router;
