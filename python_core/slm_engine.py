import os

def convert_logs_to_summary(log_file=os.path.join(os.path.dirname(__file__), "access_logs.txt")):
    """
    Reads the access log file and summarizes how many times each file was accessed.
    """
    try:
        with open(log_file, "r") as f:
            lines = f.readlines()
    except FileNotFoundError:
        return "⚠️ No logs found to summarize."

    summary = "📄 System Log Summary 📄\n"
    file_access_count = {}

    for line in lines:
        try:
            _, action, path = line.strip().split(" - ")
            file_access_count[path] = file_access_count.get(path, 0) + 1
        except ValueError:
            continue  # Skip malformed lines

    for file, count in file_access_count.items():
        summary += f"- {file} accessed {count} times\n"

    return summary


def generate_alert_summary(threat_details):
    """
    Generates a human-readable threat alert summary from the given details.
    """
    summary = f"""
🚨 SLM Threat Alert Summary 🚨
=====================================
Threat Details: {threat_details}
Recommended Action: Review user activity immediately.
=====================================
"""
    return summary


# ✅ Ensure this block runs when called via Node.js
if __name__ == "__main__":
    result = convert_logs_to_summary()
    print(result)
