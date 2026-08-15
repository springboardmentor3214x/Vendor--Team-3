import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_otp_email(to_email: str, otp: str):
    if not SMTP_SERVER or not SMTP_USERNAME or not SMTP_PASSWORD:
        print("SMTP config missing. Simulated OTP:", otp)
        return

    subject = "Verify your email for Vendor Reliability"
    body = f"""
    <html>
      <body>
        <h3>Welcome to the Vendor Reliability Portal!</h3>
        <p>Your one-time password (OTP) for registration is:</p>
        <h2>{otp}</h2>
        <p>This code will expire in 10 minutes.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = SMTP_USERNAME
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"OTP email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        # Not throwing so it doesn't break if SMTP fails
