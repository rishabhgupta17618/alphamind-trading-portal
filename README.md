# AlphaMind — AI Trading Portal
### Deploy to Vercel in 5 minutes — no coding needed

---

## What this is
A complete AI-powered trading portal connected to your Dhan broker account. Features:
- Live Dhan account sync (holdings, positions, funds, orders)
- AI market analysis with Claude — RSI, MACD, S&R, trade recommendations
- AI signals scanner for multiple stocks
- Paper trading bots for Swing, Intraday, and F&O
- Trade journal with AI insights
- Portfolio review with buy/hold/sell recommendations

---

## Deploy to Vercel — Step by Step

### Step 1 — Create a GitHub account (if you don't have one)
Go to https://github.com and sign up for free.

### Step 2 — Create a new GitHub repository
1. Click the **+** button at the top right → **New repository**
2. Name it: `alphamind-trading-portal`
3. Keep it **Public**
4. Click **Create repository**

### Step 3 — Upload these project files
1. On your new repository page, click **uploading an existing file**
2. Drag and drop ALL the files from this ZIP (the entire folder contents)
3. Click **Commit changes**

### Step 4 — Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project**
3. Find and select your `alphamind-trading-portal` repository
4. Vercel auto-detects Vite — no settings to change
5. Click **Deploy**
6. Wait ~60 seconds — you get a live URL like `https://alphamind-trading-portal.vercel.app`

### Step 5 — Open your portal
Visit your Vercel URL on any device — laptop, phone, tablet.
On first load, enter your credentials:
- **Dhan Client ID** — from web.dhan.co → My Profile → API Access
- **Dhan Access Token** — generate from same page (valid 24 hours)
- **Anthropic API Key** — from console.anthropic.com → API Keys → Create Key

Click **Connect & Launch Portal** — done!

---

## Important notes
- Dhan access tokens expire every 24 hours — go to Settings in the portal to update daily
- Your credentials are stored only in your browser (localStorage) — never sent to Vercel or any server
- All API calls go directly from your browser to Dhan and Anthropic
- Paper trades and journal entries persist in your browser across sessions

---

## Project structure
```
alphamind-trading-portal/
├── src/
│   ├── App.jsx        ← Complete portal (all pages)
│   └── main.jsx       ← React entry point
├── index.html         ← HTML entry
├── package.json       ← Dependencies
├── vite.config.js     ← Build config
└── vercel.json        ← Vercel routing config
```
