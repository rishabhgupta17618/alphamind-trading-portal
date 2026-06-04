# AlphaMind — AI Trading Portal v2
### Dhan Broker · Google Gemini AI · Vercel Deployment

---

## What's New in v2
- **Secure OTP login** — 6-digit OTP verification on every login
- **3-attempt lockout** — 24-hour lockout after 3 wrong OTPs
- **Dark / Light mode** — toggle in Settings → Appearance
- **Live Trading page** — AI proposals with manual approval + full risk controls
- **Paper trade: Manual + AI** — trade manually or let AI generate setups from news/patterns
- **Order History** — full Dhan order book
- **Logout button** — in sidebar and Settings
- **Trade history persists** — survives logout/login across sessions
- **Risk controls** — position sizing, daily loss limit, max positions, min R:R
- **Journal improvements** — filter by type, AI insights with loss patterns

---

## Deploy to Vercel — 5 Steps

### Step 1 — GitHub
1. Go to github.com → sign up (free)
2. Click **+** → **New repository** → name: `alphamind-trading-portal` → Public → Create
3. On repo page → **uploading an existing file** → extract this ZIP → drag ALL files in → Commit

### Step 2 — Vercel
1. Go to vercel.com → sign up with GitHub
2. **Add New Project** → select `alphamind-trading-portal`
3. Vercel auto-detects Vite — do NOT change any settings
4. **Deploy** → wait ~60 seconds → get your live URL

### Step 3 — First Login
Open your URL. Enter:
- **Dhan Client ID**: your numeric ID (e.g. `1101954232`)
- **Dhan Access Token**: from web.dhan.co → My Profile → API Access → Generate Token
- **Google Gemini API Key**: from aistudio.google.com/app/apikey → Create API Key (free)

Click **Continue to OTP Verification** → enter the OTP shown on screen → **Verify & Login**

---

## Credential Setup

### Dhan Client ID + Access Token
1. Open web.dhan.co → log in
2. Click profile icon → **My Profile → API Access**
3. Click **Generate Access Token**
4. Copy **Client ID** (`1101954232`) and **Access Token**
⚠ Token expires every 24 hours — update daily in Settings

### Google Gemini API Key (FREE)
1. Open aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click **Create API Key** → copy it (starts with `AIzaSy...`)
✅ Free: 1,500 requests/day, no credit card needed

---

## Features

| Page | What it does |
|---|---|
| Dashboard | Live Dhan balance, paper P&L, readiness score, recent trades |
| Market Analysis | AI technical analysis — RSI, MACD, ADX, S&R, trade recommendation |
| AI Signals | Scan 5–12 stocks for trade setups, one-click paper trade |
| Paper Trades | Manual entry, AI-powered analysis, Swing/Intraday/F&O bots |
| Live Trading | AI proposals + manual approval + risk controls → real Dhan orders |
| Portfolio | Live Dhan holdings + positions + AI portfolio review |
| Journal | Auto-logged trades, manual notes, AI insights with loss patterns |
| Strategy Guide | Full Swing vs Intraday vs F&O comparison |
| Settings | Credentials, dark/light mode, risk controls, notifications, data |

---

## OTP Security
- OTP shown in UI (developer mode — no backend SMS required)
- 3 wrong attempts = 24-hour lockout
- Only wrong OTPs count toward limit (not credential errors)
- Lock countdown shown on screen

## Trade History Persistence
- All trades stored in browser localStorage
- Persists across logout/login/browser restarts
- Both paper and live trades stored together
- Export from DevTools → Application → Local Storage → `am_trades_v2`

## Live Trading Safety
- AI generates proposal only — never auto-executes
- You must click "I Approve" then "Place Real Order" to execute
- Risk controls enforced before proposal is shown
- Full order details shown for review before placement
