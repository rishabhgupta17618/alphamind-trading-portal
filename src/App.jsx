import React, { useState, useEffect, useCallback, useRef } from 'react'
import { lsGet, lsSet, lsDel, KEYS, createBin, syncToCloud, fetchFromCloud } from './utils/storage.js'
import { useAutoExit } from './pages/PaperTrades.jsx'
import { DEFAULT_RISK } from './utils/dhan.js'

import Login        from './pages/Login.jsx'
import Dashboard    from './pages/Dashboard.jsx'
import MarketAnalysis from './pages/MarketAnalysis.jsx'
import AISignals    from './pages/AISignals.jsx'
import PaperTrades  from './pages/PaperTrades.jsx'
import LiveTrading  from './pages/LiveTrading.jsx'
import Portfolio    from './pages/Portfolio.jsx'
import Journal      from './pages/Journal.jsx'
import StrategyGuide from './pages/StrategyGuide.jsx'
import Settings     from './pages/Settings.jsx'

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const BASE_CSS = `
:root {
  --bg:#0d0f14;--bg2:#13161d;--bg3:#1a1e27;--bg4:#212631;
  --border:#252b38;--border2:#2e3547;
  --text:#e2e6f0;--text2:#8b95aa;--text3:#4a5568;
  --green:#00c896;--green2:#00a07a;
  --gb:rgba(0,200,150,.1);--gbr:rgba(0,200,150,.3);--gt:#00c896;
  --red:#ff4d6a;--rb:rgba(255,77,106,.1);--rbr:rgba(255,77,106,.3);--rt:#ff4d6a;
  --amber:#f5a623;--ab:rgba(245,166,35,.1);--abr:rgba(245,166,35,.3);--at:#f5a623;
  --blue:#4d9fff;--bb:rgba(77,159,255,.1);--bbr:rgba(77,159,255,.3);--bt:#4d9fff;
  --purple:#a78bfa;--pb:rgba(167,139,250,.1);--pbr:rgba(167,139,250,.3);--pt:#a78bfa;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:13px;overflow:hidden}
.app{display:flex;height:100vh}
.sidebar{width:200px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto}
.sb-head{padding:16px 14px 12px;border-bottom:1px solid var(--border)}
.sb-brand{display:flex;align-items:center;gap:9px;margin-bottom:3px}
.sb-icon{width:28px;height:28px;border-radius:7px;background:var(--green);display:flex;align-items:center;justify-content:center;color:#000;font-size:14px}
.sb-name{font-size:14px;font-weight:600;color:var(--text)}
.sb-sub{font-size:10px;color:var(--text3);margin-left:37px;letter-spacing:.5px;text-transform:uppercase}
.sb-nav{padding:10px 8px 6px;flex:1}
.sb-group{margin-bottom:14px}
.sb-lbl{font-size:9px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;padding:0 8px;margin-bottom:4px}
.nav-item{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:8px;cursor:pointer;color:var(--text2);font-size:12px;border:1px solid transparent;transition:all .12s}
.nav-item:hover{background:var(--bg3);color:var(--text)}
.nav-item.active{background:var(--gb);color:var(--gt);border-color:var(--gbr);font-weight:500}
.nav-item i{font-size:14px;width:17px;text-align:center}
.sb-foot{border-top:1px solid var(--border);padding:10px 12px;margin-top:auto}
.sr{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-size:11px;color:var(--text3)}
.dot{width:6px;height:6px;border-radius:50%;background:var(--text3);display:inline-block;margin-right:4px;vertical-align:middle}
.dot.live{background:var(--green);box-shadow:0 0 6px var(--green)}
.dot.blue{background:var(--blue)}
.main{flex:1;overflow-y:auto;background:var(--bg)}
.page{padding:22px 26px;max-width:1100px}
.ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;gap:12px;flex-wrap:wrap}
.pt{font-size:18px;font-weight:600;color:var(--text)}
.ps{font-size:12px;color:var(--text3);margin-top:2px}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px 18px;margin-bottom:14px}
.card-sm{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 13px}
.ct{font-size:11px;font-weight:500;color:var(--text2);letter-spacing:.4px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
@media(max-width:700px){.g4{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}.sidebar{width:160px}}
.met{background:var(--bg3);border-radius:10px;padding:12px 14px}
.ml{font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px}
.mv{font-size:20px;font-weight:600;color:var(--text)}
.ms{font-size:11px;color:var(--text3);margin-top:2px}
.bdg{display:inline-flex;align-items:center;padding:2px 8px;border-radius:5px;font-size:11px;font-weight:500}
.b-buy{background:var(--gb);color:var(--gt);border:1px solid var(--gbr)}
.b-sell{background:var(--rb);color:var(--rt);border:1px solid var(--rbr)}
.b-hold{background:var(--ab);color:var(--at)}
.b-paper{background:var(--bb);color:var(--bt);border:1px solid var(--bbr)}
.b-fno{background:var(--pb);color:var(--pt);border:1px solid var(--pbr)}
.b-win{background:var(--gb);color:var(--gt)}
.b-loss{background:var(--rb);color:var(--rt)}
.up{color:var(--green)}.dn{color:var(--red)}.mu{color:var(--text3)}
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;border:1px solid var(--border2);background:var(--bg3);color:var(--text);font-family:inherit;font-size:12px;cursor:pointer;font-weight:400;transition:all .12s}
.btn:hover{background:var(--bg4)}.btn:disabled{opacity:.4;cursor:not-allowed}
.btn-p{background:var(--green);color:#000;border-color:var(--green);font-weight:600}
.btn-p:hover{background:var(--green2);border-color:var(--green2)}
.btn-sm{padding:5px 10px;font-size:11px}
.btn-d{color:var(--rt);border-color:var(--rbr);background:var(--rb)}
input,select,textarea{background:var(--bg3);border:1px solid var(--border2);border-radius:8px;padding:8px 12px;color:var(--text);font-family:inherit;font-size:12px;outline:none;transition:border-color .12s;width:100%}
input:focus,select:focus,textarea:focus{border-color:var(--green)}
input::placeholder,textarea::placeholder{color:var(--text3)}
select option{background:var(--bg2)}
.fl{font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;display:block}
.fr{margin-bottom:11px}
table{width:100%;border-collapse:collapse;font-size:12px}
th{text-align:left;padding:8px 10px;color:var(--text3);font-weight:400;border-bottom:1px solid var(--border);font-size:10px;text-transform:uppercase;letter-spacing:.5px}
td{padding:9px 10px;border-bottom:1px solid var(--border);color:var(--text);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.02)}
.tabs{display:flex;gap:2px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:3px;margin-bottom:16px;overflow-x:auto}
.tab{padding:6px 14px;border-radius:9px;font-size:12px;color:var(--text2);cursor:pointer;transition:all .12s;white-space:nowrap;border:1px solid transparent}
.tab:hover{color:var(--text);background:var(--bg3)}
.tab.on{background:var(--bg3);color:var(--text);border-color:var(--border2)}
.al{display:flex;gap:9px;padding:10px 14px;border-radius:9px;font-size:12px;margin-bottom:13px;align-items:flex-start;line-height:1.5}
.al i{font-size:14px;flex-shrink:0;margin-top:1px}
.al-i{background:var(--bb);border:1px solid var(--bbr);color:var(--bt)}
.al-w{background:var(--ab);border:1px solid var(--abr);color:var(--at)}
.al-s{background:var(--gb);border:1px solid var(--gbr);color:var(--gt)}
.al-e{background:var(--rb);border:1px solid var(--rbr);color:var(--rt)}
.row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)}
.row:last-child{border-bottom:none}
.prog{height:5px;background:var(--bg3);border-radius:3px;overflow:hidden}
.prog-f{height:100%;border-radius:3px;background:var(--green);transition:width .5s}
.sig{width:7px;height:7px;border-radius:50%;display:inline-block;flex-shrink:0}
.sig-b{background:var(--green)}.sig-r{background:var(--red)}.sig-a{background:var(--amber)}
.spin{display:inline-block;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ob-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg)}
.ob-card{width:100%;max-width:440px;background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:30px}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
`

const LIGHT_CSS = `
body.light {
  --bg:#f0f2f5;--bg2:#ffffff;--bg3:#f5f6f8;--bg4:#ebedf0;
  --border:#e0e3e8;--border2:#c8ccd4;
  --text:#1a1d24;--text2:#4a5568;--text3:#8a94a6;
  --green:#0a7c5c;--green2:#086a4e;
  --gb:rgba(10,124,92,.08);--gbr:rgba(10,124,92,.25);--gt:#0a7c5c;
  --red:#c0392b;--rb:rgba(192,57,43,.08);--rbr:rgba(192,57,43,.25);--rt:#c0392b;
  --amber:#8a5700;--ab:rgba(138,87,0,.08);--abr:rgba(138,87,0,.25);--at:#8a5700;
  --blue:#1a5fa5;--bb:rgba(26,95,165,.08);--bbr:rgba(26,95,165,.25);--bt:#1a5fa5;
  --purple:#4a3a9a;--pb:rgba(74,58,154,.08);--pbr:rgba(74,58,154,.25);--pt:#4a3a9a;
}
body.light input, body.light select, body.light textarea { background: #fff; }
body.light .sidebar { background: #fff; }
body.light .ob-card { background: #fff; }
body.light .card { background: #fff; }
body.light tr:hover td { background: rgba(0,0,0,.02); }
`

export default function App() {
  const [creds,       setCreds]       = useState(() => lsGet(KEYS.CREDS, { cid:'', tok:'', akey:'' }))
  const [auth,        setAuth]        = useState(() => lsGet(KEYS.AUTH, null))
  const [trades,      setTrades]      = useState(() => lsGet(KEYS.TRADES, []))
  const [journal,     setJournal]     = useState(() => lsGet(KEYS.JOURNAL, []))
  const [settings,    setSettings]    = useState(() => lsGet(KEYS.SETTINGS, { theme:'dark', accent:'#00c896', fontSize:'medium', sidebarWidth:'normal' }))
  const [riskConfig,  setRiskConfig]  = useState(() => lsGet(KEYS.RISK, DEFAULT_RISK))
  const [holdings,    setHoldings]    = useState([])
  const [positions,   setPositions]   = useState([])
  const [funds,       setFunds]       = useState(null)
  const [page,        setPage]        = useState('dashboard')

  const isLoggedIn = auth?.loggedIn && !!(creds.cid && creds.tok && creds.akey)

  // Apply theme
  useEffect(() => {
    const body = document.body
    if (settings.theme === 'light') body.classList.add('light')
    else if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (!prefersDark) body.classList.add('light')
      else body.classList.remove('light')
    } else { body.classList.remove('light') }
  }, [settings.theme])

  // Persist trades
  useEffect(() => { lsSet(KEYS.TRADES, trades) }, [trades])
  useEffect(() => { lsSet(KEYS.JOURNAL, journal) }, [journal])

  // Point 3: Auto-exit paper trades at T1 or SL
  useAutoExit(trades, closeTrade)

  // Point 4: Cloud sync — persist trades across devices via JSONBin
  const syncRef = useRef(null)
  useEffect(() => {
    if (!creds.cid) return
    const binKey = 'am_bin_' + creds.cid
    const doSync = async () => {
      let binId = localStorage.getItem(binKey)
      const payload = { trades, journal, syncedAt: new Date().toISOString() }
      if (!binId) {
        binId = await createBin(creds.cid, payload)
        if (binId) localStorage.setItem(binKey, binId)
      } else {
        await syncToCloud(binId, payload)
      }
    }
    clearTimeout(syncRef.current)
    syncRef.current = setTimeout(doSync, 3000) // debounce 3s
    return () => clearTimeout(syncRef.current)
  }, [trades, journal, creds.cid])

  // On login: pull latest from cloud
  const pullFromCloud = useCallback(async (clientId) => {
    const binKey = 'am_bin_' + clientId
    const binId  = localStorage.getItem(binKey)
    if (!binId) return
    const data = await fetchFromCloud(binId)
    if (!data) return
    if (data.trades?.length > 0) {
      setTrades(data.trades)
      lsSet(KEYS.TRADES, data.trades)
    }
    if (data.journal?.length > 0) {
      setJournal(data.journal)
      lsSet(KEYS.JOURNAL, data.journal)
    }
  }, [])

  const handleLogin = useCallback((newCreds) => {
    setCreds(newCreds)
    const authData = { loggedIn: true, at: Date.now() }
    setAuth(authData)
    lsSet(KEYS.AUTH, authData)
    setPage('dashboard')
    pullFromCloud(newCreds.cid)
  }, [])

  const handleLogout = useCallback(() => {
    lsDel(KEYS.AUTH)
    setAuth(null)
    setPage('dashboard')
  }, [])

  const openTrade = useCallback((t) => {
    const id   = 'PT' + Date.now().toString(36).slice(-6).toUpperCase()
    const risk = Math.abs(t.entry - t.sl) * t.qty
    const rew  = Math.abs(t.t1 - t.entry) * t.qty
    const trade = {
      id, ...t,
      status: 'OPEN', pnl: null, result: null,
      openedAt: new Date().toISOString(), closedAt: null,
      rr: risk > 0 ? (rew / risk).toFixed(2) : '—'
    }
    setTrades(prev => [trade, ...prev])
    setJournal(prev => [{
      id: 'J' + Date.now().toString(36), ts: new Date().toISOString(),
      type: 'open', sym: t.sym,
      note: `${t.tradeType==='live'?'🔴 LIVE':'📋 Paper'} ${t.style} ${t.dir} opened @ ₹${t.entry} (source: ${t.source||'manual'})`
    }, ...prev])
  }, [])

  const closeTrade = useCallback((id, exitP, autoExit = false) => {
    setTrades(prev => prev.map(t => {
      if (t.id !== id || t.status !== 'OPEN') return t
      const pnl    = t.dir === 'LONG' ? (exitP - t.entry) * t.qty : (t.entry - exitP) * t.qty
      const closed = { ...t, status: 'CLOSED', exitP, pnl: Math.round(pnl * 100) / 100, result: pnl > 0 ? 'WIN' : 'LOSS', closedAt: new Date().toISOString(), autoExit }
      setJournal(prev => [{
        id: 'J' + Date.now().toString(36), ts: new Date().toISOString(),
        type: pnl > 0 ? 'win' : 'loss', sym: t.sym, pnl: closed.pnl,
        note: `Closed @ ₹${exitP} — ${pnl >= 0 ? '+' : ''}₹${Math.round(pnl).toLocaleString('en-IN')}`
      }, ...prev])
      return closed
    }))
  }, [])

  const addJournal = useCallback((entry) => {
    setJournal(prev => [{ id: 'J' + Date.now().toString(36), ts: new Date().toISOString(), ...entry }, ...prev])
  }, [])

  const closed = trades.filter(t => t.status === 'CLOSED')
  const wins   = closed.filter(t => t.result === 'WIN')
  const wr     = closed.length ? Math.round(wins.length / closed.length * 100) : 0
  const wp     = wins.reduce((s, t) => s + (t.pnl || 0), 0)
  const lp     = Math.abs(closed.filter(t => t.result === 'LOSS').reduce((s, t) => s + (t.pnl || 0), 0))
  const rd     = Math.min(100, Math.round(
    (Math.min(closed.length / 20, 1) * 25) +
    (closed.length ? Math.min(wr / 55, 1) * 25 : 0) +
    (lp > 0 ? Math.min(wp / lp / 1.5, 1) * 25 : wins.length ? 25 : 0) + 25
  ))

  const NAV = [
    { group:'Main',    id:'dashboard', icon:'ti-layout-dashboard', label:'Dashboard'     },
    { group:'Main',    id:'market',    icon:'ti-chart-candle',      label:'Market Analysis'},
    { group:'Main',    id:'signals',   icon:'ti-bulb',              label:'AI Signals'    },
    { group:'Trading', id:'paper',     icon:'ti-flask',             label:'Paper Trades'  },
    { group:'Trading', id:'live',      icon:'ti-brand-speedtest',   label:'Live Trading'  },
    { group:'Trading', id:'portfolio', icon:'ti-briefcase',         label:'Portfolio'     },
    { group:'Trading', id:'journal',   icon:'ti-notebook',          label:'Journal'       },
    { group:'Learn',   id:'guide',     icon:'ti-book',              label:'Strategy Guide'},
  ]

  if (!isLoggedIn) return (
    <>
      <style>{BASE_CSS + LIGHT_CSS}</style>
      <Login onLogin={handleLogin} />
    </>
  )

  return (
    <>
      <style>{BASE_CSS + LIGHT_CSS}</style>
      <div className="app">
        {/* SIDEBAR */}
        <nav className="sidebar">
          <div className="sb-head">
            <div className="sb-brand">
              <div className="sb-icon"><i className="ti ti-chart-line" /></div>
              <span className="sb-name">AlphaMind</span>
            </div>
            <div className="sb-sub">AI Trading Portal</div>
          </div>
          <div className="sb-nav">
            {['Main','Trading','Learn'].map(grp => (
              <div key={grp} className="sb-group">
                <div className="sb-lbl">{grp}</div>
                {NAV.filter(n => n.group === grp).map(n => (
                  <div key={n.id} className={`nav-item${page===n.id?' active':''}`} onClick={() => setPage(n.id)}>
                    <i className={`ti ${n.icon}`} />{n.label}
                    {n.id === 'live' && <span className="bdg b-hold" style={{fontSize:9,marginLeft:'auto'}}>LIVE</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sb-foot">
            <div className="sr">
              <span><span className="dot live"/><span style={{fontSize:11}}>Dhan: ready</span></span>
            </div>
            <div className="sr">
              <span><span className="dot blue"/><span style={{color:'var(--blue)',fontSize:11}}>Paper · {rd}/100</span></span>
            </div>
            <div className={`nav-item${page==='settings'?' active':''}`} onClick={()=>setPage('settings')} style={{marginTop:4}}>
              <i className="ti ti-settings"/>Settings
            </div>
            <div className="nav-item" onClick={handleLogout} style={{marginTop:2,color:'var(--rt)'}}>
              <i className="ti ti-logout"/>Logout
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <div className="main">
          {page==='dashboard' && <Dashboard creds={creds} trades={trades} funds={funds} setFunds={setFunds} setHoldings={setHoldings} setPositions={setPositions} onNavigate={setPage}/>}
          {page==='market'    && <MarketAnalysis creds={creds} onAddTrade={t=>{openTrade(t);setPage('paper')}}/>}
          {page==='signals'   && <AISignals creds={creds} trades={trades} onAddTrade={openTrade}/>}
          {page==='paper'     && <PaperTrades creds={creds} trades={trades} onOpen={openTrade} onClose={closeTrade}/>}
          {page==='live'      && <LiveTrading creds={creds} riskConfig={riskConfig} setRiskConfig={setRiskConfig} onAddTrade={openTrade} funds={funds}/>}
          {page==='portfolio' && <Portfolio creds={creds} holdings={holdings} positions={positions} funds={funds} setHoldings={setHoldings} setPositions={setPositions} setFunds={setFunds}/>}
          {page==='journal'   && <Journal creds={creds} journal={journal} trades={trades} onAdd={addJournal}/>}
          {page==='guide'     && <StrategyGuide/>}
          {page==='settings'  && <Settings creds={creds} setCreds={setCreds} settings={settings} setSettings={s=>{setSettings(s);lsSet(KEYS.SETTINGS,s)}} riskConfig={riskConfig} setRiskConfig={setRiskConfig} onLogout={handleLogout}/>}
        </div>
      </div>
    </>
  )
}
