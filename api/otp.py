"""
OTP Service — Vercel Serverless Function
Sends OTP via email (Gmail SMTP) and SMS (Fast2SMS free tier).
Endpoint: /api/otp
POST { "action": "send", "otp": "123456" }   → sends OTP to configured recipient
POST { "action": "verify", ... }              → verification is done client-side (OTP in localStorage)
"""

import json
import os
import smtplib
import ssl
import urllib.request
import urllib.parse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler


# ── Config from Vercel Environment Variables ──────────────────────────────────
GMAIL_USER      = os.environ.get("GMAIL_USER", "")        # your Gmail address
GMAIL_APP_PASS  = os.environ.get("GMAIL_APP_PASS", "")    # Gmail App Password (not account password)
RECIPIENT_EMAIL = os.environ.get("RECIPIENT_EMAIL", "rishabhgupta17618@gmail.com")
RECIPIENT_PHONE = os.environ.get("RECIPIENT_PHONE", "8278817918")
FAST2SMS_KEY    = os.environ.get("FAST2SMS_KEY", "")      # fast2sms.com free API key


def send_email_otp(otp: str) -> tuple[bool, str]:
    """Send OTP via Gmail SMTP using App Password"""
    if not GMAIL_USER or not GMAIL_APP_PASS:
        return False, "Gmail credentials not configured in environment variables"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"AlphaMind Login OTP: {otp}"
    msg["From"]    = GMAIL_USER
    msg["To"]      = RECIPIENT_EMAIL

    text_body = f"""
AlphaMind Trading Portal — Login OTP

Your one-time password is: {otp}

This OTP is valid for 10 minutes.
Do not share this with anyone.

If you did not request this, please ignore this email.
"""
    html_body = f"""
<div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px;background:#13161d;color:#e2e6f0;border-radius:12px">
  <div style="font-size:22px;font-weight:700;color:#00c896;margin-bottom:6px">α AlphaMind</div>
  <div style="font-size:12px;color:#4a5568;margin-bottom:24px;letter-spacing:.5px">AI TRADING PORTAL</div>
  <div style="font-size:14px;color:#8b95aa;margin-bottom:16px">Your login OTP:</div>
  <div style="font-size:40px;font-weight:700;letter-spacing:12px;color:#ffffff;background:#1a1e27;padding:16px 24px;border-radius:10px;text-align:center;margin-bottom:16px">{otp}</div>
  <div style="font-size:12px;color:#4a5568;line-height:1.7">
    Valid for <strong style="color:#f5a623">10 minutes</strong>.<br>
    Do not share this OTP with anyone.<br>
    If you did not request this, ignore this email.
  </div>
</div>
"""
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASS)
            server.sendmail(GMAIL_USER, RECIPIENT_EMAIL, msg.as_string())
        return True, "Email sent"
    except Exception as e:
        return False, f"Email error: {str(e)}"


def send_sms_otp(otp: str) -> tuple[bool, str]:
    """Send OTP via Fast2SMS (free tier — 50 SMS/month free)"""
    if not FAST2SMS_KEY:
        return False, "Fast2SMS key not configured"

    try:
        message = f"AlphaMind OTP: {otp}. Valid for 10 minutes. Do not share."
        params  = urllib.parse.urlencode({
            "authorization": FAST2SMS_KEY,
            "route":         "q",
            "message":       message,
            "numbers":       RECIPIENT_PHONE,
            "flash":         "0",
        })
        url = f"https://www.fast2sms.com/dev/bulkV2?{params}"
        req = urllib.request.Request(url, headers={"cache-control": "no-cache"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode())
            if body.get("return"):
                return True, "SMS sent"
            return False, f"Fast2SMS error: {body.get('message','Unknown')}"
    except Exception as e:
        return False, f"SMS error: {str(e)}"


class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        result = {}
        try:
            length = int(self.headers.get("Content-Length", 0))
            req    = json.loads(self.rfile.read(length))
            action = req.get("action", "")
            otp    = str(req.get("otp", "")).strip()

            if action == "send":
                if not otp or len(otp) != 6:
                    result = {"success": False, "error": "Invalid OTP format"}
                else:
                    email_ok,  email_msg  = send_email_otp(otp)
                    sms_ok,    sms_msg    = send_sms_otp(otp)

                    result = {
                        "success":   email_ok or sms_ok,
                        "email":     {"sent": email_ok, "message": email_msg},
                        "sms":       {"sent": sms_ok,   "message": sms_msg},
                    }

                    if not email_ok and not sms_ok:
                        result["error"] = "Both email and SMS delivery failed"
            else:
                result = {"success": False, "error": f"Unknown action: {action}"}

        except Exception as e:
            result = {"success": False, "error": str(e)}

        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
