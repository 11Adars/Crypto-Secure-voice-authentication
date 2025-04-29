# import os
# import re
# import sys
# import io
# from datetime import datetime
# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# def convert_logs_to_summary(log_file=os.path.join(os.path.dirname(__file__), "../backend/logs/alerts.log")):
   
#     try:
#         with open(log_file, "r", encoding="utf-8") as f:
#             lines = f.readlines()
#     except FileNotFoundError:
#         print("Log file not found.")
#         return "No logs found to summarize."

#     log_pattern = re.compile(r'(?P<timestamp>\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s*-\s*(?P<action>.+)')
#     entries = []

#     for line in lines:
#         match = log_pattern.match(line.strip())
#         if match:
#             ts = match.group("timestamp")
#             action = match.group("action")
#             entries.append(f"{ts} - {action}")

#     if not entries:
#         return "No valid access entries found."

#     summary = "Access Log Summary\n\n"
#     summary += "\n".join(entries)
#     return summary.strip()

# if __name__ == "__main__":
#     result = convert_logs_to_summary()
#     print(result)


import os
import re
import sys
import io
from datetime import datetime

# Fix Unicode output for emojis, etc.
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def convert_logs_to_summary(log_file=os.path.join(os.path.dirname(__file__), "../backend/logs/alerts.log")):
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except FileNotFoundError:
        print("Log file not found.")
        return "No logs found to summarize."

    # Updated pattern: Timestamp - Action - File
    log_pattern = re.compile(
        r'(?P<timestamp>\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s*-\s*(?P<action>.+?)\s*-\s*(?P<file>.+)'
    )

    entries = []

    for line in lines:
        match = log_pattern.match(line.strip())
        if match:
            ts = match.group("timestamp")
            action = match.group("action").strip()
            file = match.group("file").strip()

            # Convert timestamp to readable format
            try:
                ts_dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                time_str = ts_dt.strftime("%I:%M %p on %B %d")
            except:
                time_str = ts  # fallback if parsing fails

            summary_line = f"At {time_str}, a '{action}' was detected on {file}."
            entries.append(summary_line)

    if not entries:
        return "No valid access entries found."

    summary = "Access Log Summary\n\n"
    summary += "\n".join(entries)
    return summary.strip()

if __name__ == "__main__":
    result = convert_logs_to_summary()
    print(result)
