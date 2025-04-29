# threat_detection.py
import os
from datetime import datetime

THREAT_LOG = "threats.txt"

def detect_threat(log_file="alerts.log", threshold=10):
    with open(log_file, "r") as f:
        logs = f.readlines()

    # Basic logic: If more than `threshold` changes in under a minute → suspicious
    recent = logs[-threshold:]
    timestamps = [datetime.strptime(line.split(" - ")[0], "%a %b %d %H:%M:%S %Y") for line in recent]

    if len(timestamps) < threshold:
        return False

    time_diff = (timestamps[-1] - timestamps[0]).total_seconds()

    if time_diff <= 60:  # 60 seconds
        log_threat()
        return True
    return False

def log_threat():
    with open(THREAT_LOG, "a") as f:
        entry = f"[ALERT] Suspicious activity at {datetime.now()}\n"
        f.write(entry)
    print(entry)
