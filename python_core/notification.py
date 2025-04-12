# notification.py
import smtplib


# python_core/notification.py

def show_alert_notification(message):
    print("\n" + "="*50)
    print("⚠️  ALERT NOTIFICATION ⚠️")
    print(message)
    print("="*50 + "\n")

