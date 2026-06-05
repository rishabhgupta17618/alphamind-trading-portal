# AlphaMind — AI Trading Portal v3
### Production Grade · Dhan Broker · Google Gemini AI Pro · Vercel

---

## Architecture (Production)

```
Browser → Vercel Frontend (React)
              ↓
       Vercel Serverless Functions (Python)
         /api/dhan.py    → Dhan API (bypasses CORS)
         /api/gemini.py  → Google Gemini AI (with fallback)
         /api/otp.py     → Gmail SMTP + Fast2SMS (real OTP)
```

All API calls are server-side. No CORS issues. No credentials exposed in browser.

---

## Deploy to Vercel — Step by Step

### Step 1 — Upload to GitHub
1. Create account at github.com
2. New repository → name: `alphamind-trading-portal` → Public → Create
3. Upload all files from this ZIP (keeping folder structure: `src/`, `api/`)
4. Commit changes

### Step 2 — Deploy on Vercel
1. Go to vercel.com → sign up with GitHub
2. Add New Project → select `alphamind-trading-portal`
3. Do NOT change any build settings — Vercel auto-detects Vite
4. **BEFORE clicking Deploy** — add Environment Variables (see Step 3)
5. Click Deploy → wait ~90 seconds

### Step 3 — Set Environment Variables on Vercel ⚠ REQUIRED
In your Vercel project → Settings → Environment Variables, add these:

| Variable Name     | Value                          | Description |
|---|---|---|
| `GMAIL_USER`      | your.gmail@gmail.com           | Gmail address that sends OTP |
| `GMAIL_APP_PASS`  | xxxx xxxx xxxx xxxx            | Gmail App Password (NOT account password) |
| `RECIPIENT_EMAIL` | rishabhgupta17618@gmail.com    | Email to receive OTP |
| `RECIPIENT_PHONE` | 8278817918                     | Phone to receive OTP SMS |
| `FAST2SMS_KEY`    | your_fast2sms_api_key          | SMS delivery (fast2sms.com) |
| `GEMINI_API_KEY`  | AIzaSy...                      | Optional — stored server-side |

**After adding variables → Redeploy the project.**

---

## Getting Gmail App Password
1. Go to myaccount.google.com → Security
2. Enable **2-Step Verification** (required)
3. Search for "App passwords" → Select app: Mail → Device: Other → "AlphaMind"
4. Copy the 16-character password shown (e.g. `abcd efgh ijkl mnop`)
5. Paste as `GMAIL_APP_PASS` in Vercel (without spaces: `abcdefghijklmnop`)

## Getting Fast2SMS API Key (Free SMS — 50/month)
1. Go to fast2sms.com → Sign up free
2. Dashboard → Dev API → copy the API key
3. Paste as `FAST2SMS_KEY` in Vercel

---

## First Login
1. Open your Vercel URL
2. Enter: Dhan Client ID (`1101954232`), Access Token, Gemini API Key
3. Click **Continue** — OTP sent to +91 82788 17918 and rishabhgupta17618@gmail.com
4. Enter OTP → Login

## Security
- OTP is 6 digits, valid 10 minutes
- 3 wrong OTP attempts → 24-hour lockout
- Only wrong OTPs count toward lockout (not credential errors)
- All API calls server-side — no credentials exposed to browser network tab
- Dhan token stored only in browser localStorage

## Dhan Token Renewal
Token expires every 24 hours. To renew:
1. Open portal → Settings → Profile & Credentials
2. Go to web.dhan.co → My Profile → API Access → Generate Token
3. Paste new token → Save Credentials
