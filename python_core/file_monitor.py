import os
from datetime import datetime

# Ensure logs.txt is always saved in the same folder as this script
BASE_DIR = os.path.dirname(__file__)
LOG_FILE = os.path.join(BASE_DIR, "access_logs.txt")
CONFIDENTIAL_FILE = os.path.join(BASE_DIR, "confidential.txt")


def monitor_file_access(file_path):
    if not os.path.exists(file_path):
        print(f"[!] File {file_path} does not exist.")
        return False

    log_entry = f"{datetime.now()} - ACCESSED - {file_path}\n"
    with open(LOG_FILE, "a") as log:
        log.write(log_entry)

    return True


def simulate_file_access(file_path):
    if not os.path.exists(file_path):
        print(f"[!] File {file_path} not found. Creating it for demo...")
        with open(file_path, "w") as f:
            f.write("This is a demo confidential file.\nDo not share.")

    monitor_file_access(file_path)


# ✅ Add this so it runs when called from backend
if __name__ == "__main__":
    simulate_file_access(CONFIDENTIAL_FILE)
