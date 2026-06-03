# AlphaMind — AI Trading Portal
### 100% Free · Dhan Broker · Google Gemini AI · Deploy on Vercel

---

## Everything is FREE
| Service | Cost | Purpose |
|---|---|---|
| Dhan API | Free (your broker account) | Live holdings, positions, funds |
| Google Gemini API | Free (1,500 requests/day) | All AI analysis and recommendations |
| Vercel hosting | Free tier | Deploy and serve the portal |
| GitHub | Free | Store the code |

**No credit card. No billing. No hidden charges.**

---

## Deploy to Vercel — 5 Steps

### Step 1 — Create GitHub account
Go to https://github.com and sign up for free.

### Step 2 — Create a new repository
1. Click **+** → **New repository**
2. Name: `alphamind-trading-portal`
3. Keep it **Public**
4. Click **Create repository**

### Step 3 — Upload project files
1. On the new repo page click **uploading an existing file**
2. Extract this ZIP on your computer
3. Drag ALL the extracted files into the GitHub upload window
4. Click **Commit changes**

### Step 4 — Deploy on Vercel
1. Go to https://vercel.com → sign up with your GitHub account
2. Click **Add New Project**
3. Select your `alphamind-trading-portal` repository
4. Vercel auto-detects Vite — do NOT change any settings
5. Click **Deploy**
6. Wait ~60 seconds → get a live URL like `https://alphamind-trading-portal.vercel.app`

### Step 5 — Open and configure
Visit your Vercel URL on any device. On first load enter:

**① Dhan Client ID + Access Token**
- Open web.dhan.co → log in → Profile icon → My Profile → API Access
- Click Generate Access Token
- Copy Client ID and Access Token
- ⚠ Token expires every 24 hours — update daily in Settings

**② Google Gemini API Key (FREE)**
- Open https://aistudio.google.com/app/apikey
- Sign in with your Google account
- Click Create API Key → Copy it (starts with AIzaSy...)
- Free quota: 1,500 requests/day, no credit card needed

Click **Connect & Launch Portal** — done!

---

## Project structure
```
alphamind-trading-portal/
├── src/
│   ├── App.jsx        ← Complete portal (all pages, Gemini AI)
│   └── main.jsx       ← React entry point
├── index.html         ← HTML entry
├── package.json       ← Dependencies (React + Vite only)
├── vite.config.js     ← Build config
├── vercel.json        ← Vercel SPA routing
└── README.md          ← This file
```

## What's in the portal
- Dashboard — live Dhan balance, paper P&L, readiness score
- Market Analysis — AI technical analysis (RSI, MACD, S&R, trend)
- AI Signals — scan 5–12 stocks for trade setups
- Paper Trades — Swing / Intraday / F&O bots with strategy guides
- Portfolio — live Dhan holdings + AI portfolio review
- Journal — auto-logged trade entries + notes
- Strategy Guide — full comparison of all 3 trading styles

## Important
- Your credentials are stored only in your browser (localStorage)
- They are sent directly to Dhan and Google APIs — never to Vercel or any server
- Paper trades and journal entries persist in your browser across sessions
