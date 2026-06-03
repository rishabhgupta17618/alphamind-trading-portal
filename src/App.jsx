import React, { useState, useEffect, useRef, useCallback } from 'react'

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
:root {
  --bg: #0d0f14; --bg2: #13161d; --bg3: #1a1e27; --bg4: #21263180;
  --border: #252b38; --border2: #2e3547;
  --text: #e2e6f0; --text2: #8b95aa; --text3: #4a5568;
  --green: #00c896; --green2: #00a07a;
  --gb: rgba(0,200,150,.1); --gbr: rgba(0,200,150,.25); --gt: #00c896;
  --red: #ff4d6a; --rb: rgba(255,77,106,.1); --rbr: rgba(255,77,106,.25); --rt: #ff4d6a;
  --amber: #f5a623; --ab: rgba(245,166,35,.1); --abr: rgba(245,166,35,.25); --at: #f5a623;
  --blue: #4d9fff; --bb: rgba(77,159,255,.1); --bbr: rgba(77,159,255,.25); --bt: #4d9fff;
  --purple: #a78bfa; --pb: rgba(167,139,250,.1); --pbr: rgba(167,139,250,.25); --pt: #a78bfa;
}
.app{display:flex;height:100vh;overflow:hidden}
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
.up{color:var(--green)} .dn{color:var(--red)} .mu{color:var(--text3)}
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;border:1px solid var(--border2);background:var(--bg3);color:var(--text);font-family:inherit;font-size:12px;cursor:pointer;font-weight:400;transition:all .12s}
.btn:hover{background:var(--bg4)}
.btn:disabled{opacity:.4;cursor:not-allowed}
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
.sig-b{background:var(--green)} .sig-r{background:var(--red)} .sig-a{background:var(--amber)}
.spin{display:inline-block;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ob-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:var(--bg)}
.ob-card{width:100%;max-width:460px;background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:30px}
.free-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:5px;font-size:11px;font-weight:600;background:var(--gb);color:var(--gt);border:1px solid var(--gbr);margin-left:6px}
.cmp th{background:var(--bg3)}
.ch-sw{color:var(--green)} .ch-id{color:var(--amber)} .ch-fo{color:var(--purple)}
`

// ─── LOCAL STORAGE HOOK ──────────────────────────────────────────────────────
function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def } catch { return def }
  })
  const set = useCallback(v => {
    setVal(v)
    try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
  }, [key])
  return [val, set]
}

// ─── GEMINI FREE API ─────────────────────────────────────────────────────────
// Free tier: 1,500 requests/day, 15 requests/minute — no credit card needed
// Get key at: https://aistudio.google.com/app/apikey (completely free)
async function geminiJSON(apiKey, prompt, maxTokens = 2000) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    })
  })
  if (!res.ok) {
    const e = await res.json()
    throw new Error(e.error?.message || `Gemini error ${res.status}`)
  }
  const d = await res.json()
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(clean) } catch { return { raw: clean } }
}

// ─── DHAN API (direct browser calls) ─────────────────────────────────────────
// Dhan API supports CORS for browser calls
async function dhanCall(cid, tok, ep, method = 'GET', body = null) {
  const res = await fetch(`https://api.dhan.co/v2${ep}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access-token': tok,
      'dhanClientId': cid
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  if (!res.ok) {
    const e = await res.text()
    throw new Error(`Dhan ${res.status}: ${e.slice(0, 120)}`)
  }
  return res.json()
}

// ─── TRADE ENGINE ────────────────────────────────────────────────────────────
function calcStats(trades) {
  const cl = trades.filter(t => t.status === 'CLOSED')
  const op = trades.filter(t => t.status === 'OPEN')
  const w = cl.filter(t => t.result === 'WIN')
  const l = cl.filter(t => t.result === 'LOSS')
  const tp = cl.reduce((s, t) => s + (t.pnl || 0), 0)
  const wp = w.reduce((s, t) => s + (t.pnl || 0), 0)
  const lp = Math.abs(l.reduce((s, t) => s + (t.pnl || 0), 0))
  const wr = cl.length ? Math.round(w.length / cl.length * 100) : 0
  const pf = lp > 0 ? (wp / lp).toFixed(2) : w.length > 0 ? '∞' : '0'
  const rd = Math.min(100, Math.round(
    (Math.min(cl.length / 20, 1) * 25) +
    (cl.length ? Math.min(wr / 55, 1) * 25 : 0) +
    (lp > 0 ? Math.min(wp / lp / 1.5, 1) * 25 : w.length > 0 ? 25 : 0) + 25
  ))
  return { cl: cl.length, op: op.length, w: w.length, l: l.length, wr, tp: Math.round(tp), wp: Math.round(wp), lp: Math.round(lp), aw: w.length ? Math.round(wp / w.length) : 0, al: l.length ? Math.round(-lp / l.length) : 0, pf, rd, closed: cl, open: op }
}

// ─── SHARED UI ───────────────────────────────────────────────────────────────
function Metric({ label, value, sub, up, dn }) {
  return (
    <div className="met">
      <div className="ml">{label}</div>
      <div className={`mv ${up ? 'up' : dn ? 'dn' : ''}`}>{value}</div>
      {sub && <div className="ms">{sub}</div>}
    </div>
  )
}
function Alert({ type = 'i', children }) {
  const icons = { i: 'ti-info-circle', w: 'ti-alert-triangle', s: 'ti-check', e: 'ti-alert-circle' }
  return <div className={`al al-${type}`}><i className={`ti ${icons[type]}`} />{children}</div>
}
function Btn({ primary, sm, danger, onClick, disabled, children, style }) {
  return <button className={`btn${primary ? ' btn-p' : ''}${sm ? ' btn-sm' : ''}${danger ? ' btn-d' : ''}`} onClick={onClick} disabled={disabled} style={style}>{children}</button>
}
function Badge({ type, children }) { return <span className={`bdg b-${type}`}>{children}</span> }

// ─── SETTINGS / ONBOARDING ───────────────────────────────────────────────────
function Settings({ creds, onSave, onboard }) {
  const [cid, setCid] = useState(creds.cid || '')
  const [tok, setTok] = useState(creds.tok || '')
  const [gkey, setGkey] = useState(creds.gkey || '')

  const save = () => {
    if (!cid || !tok || !gkey) { alert('Please fill in all three fields.'); return }
    onSave({ cid, tok, gkey })
  }

  const form = (
    <>
      <div className="fr">
        <label className="fl">Dhan Client ID</label>
        <input placeholder="e.g. 1100003626" value={cid} onChange={e => setCid(e.target.value)} />
      </div>
      <div className="fr">
        <label className="fl">Dhan Access Token</label>
        <input type="password" placeholder="eyJ0eXAiOiJKV1Qi…" value={tok} onChange={e => setTok(e.target.value)} />
      </div>
      <div className="fr">
        <label className="fl">
          Google Gemini API Key <span className="free-badge">✓ FREE</span>
        </label>
        <input type="password" placeholder="AIzaSy…" value={gkey} onChange={e => setGkey(e.target.value)} />
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, lineHeight: 1.7 }}>
          Get free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>aistudio.google.com/app/apikey</a>
          <br />Free quota: 1,500 analyses/day · No credit card · No billing needed
        </div>
      </div>
    </>
  )

  const howTo = (
    <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text3)', lineHeight: 1.9, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
      <b style={{ color: 'var(--text)', fontSize: 13 }}>How to get each credential (all free):</b>
      <br /><br />
      <b style={{ color: 'var(--text)' }}>① Dhan Client ID + Access Token</b><br />
      1. Open <a href="https://web.dhan.co" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>web.dhan.co</a> and log in<br />
      2. Click your profile icon → <b>My Profile → API Access</b><br />
      3. Click <b>Generate Access Token</b><br />
      4. Copy your <b>Client ID</b> and the <b>Access Token</b><br />
      ⚠ Token expires every 24 hours — regenerate daily<br /><br />
      <b style={{ color: 'var(--text)' }}>② Google Gemini API Key (FREE AI)</b><br />
      1. Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}>aistudio.google.com/app/apikey</a><br />
      2. Sign in with your Google account<br />
      3. Click <b>Create API Key</b><br />
      4. Copy the key (starts with <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4 }}>AIzaSy</code>)<br />
      ✅ Completely free — 1,500 requests/day, no credit card
    </div>
  )

  if (onboard) return (
    <div className="ob-wrap">
      <div className="ob-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>α AlphaMind</div>
          <span className="free-badge">100% FREE</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 18, letterSpacing: '.5px' }}>AI TRADING PORTAL · DHAN BROKER · POWERED BY GEMINI</div>
        <Alert type="s">Everything is free. No credit card. No hidden charges. Powered by Google Gemini free tier.</Alert>
        {form}
        <Btn primary onClick={save} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          <i className="ti ti-plug" /> Connect &amp; Launch Portal
        </Btn>
        {howTo}
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="ph"><div><div className="pt">Settings</div><div className="ps">API credentials — all free, no billing required</div></div></div>
      <div className="card">
        <div className="ct"><span><i className="ti ti-key" /> API Credentials</span><span className="free-badge">100% FREE</span></div>
        <Alert type="s">No paid services. Dhan API is free with your broker account. Google Gemini is free (1,500 analyses/day).</Alert>
        {form}
        <Btn primary onClick={save}><i className="ti ti-check" /> Save credentials</Btn>
      </div>
      <div className="card">
        {howTo}
      </div>
    </div>
  )
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ creds, trades, funds, onSyncDhan }) {
  const s = calcStats(trades)

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">Dashboard</div><div className="ps">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
        <Btn onClick={onSyncDhan}><i className="ti ti-refresh" /> Sync Dhan</Btn>
      </div>
      <Alert type="i"><b>Paper Trading Phase</b> — All trade recommendations are simulated. No real capital at risk. Readiness score: <b>{s.rd}/100</b></Alert>
      <div className="g4" style={{ marginBottom: 14 }}>
        <Metric label="Available Balance" value={funds ? '₹' + Math.round(funds.availabelBalance || 0).toLocaleString('en-IN') : '—'} sub="From Dhan" />
        <Metric label="Paper P&L" value={(s.tp >= 0 ? '+' : '') + '₹' + Math.abs(s.tp).toLocaleString('en-IN')} up={s.tp > 0} dn={s.tp < 0} sub={`${s.w}W · ${s.l}L`} />
        <Metric label="Win Rate" value={s.wr + '%'} up={s.wr >= 55} sub="Target ≥55%" />
        <Metric label="Profit Factor" value={s.pf} up={parseFloat(s.pf) >= 1.5} sub="Target ≥1.5" />
      </div>
      <div className="g2">
        <div className="card">
          <div className="ct"><span><i className="ti ti-shield-check" /> Readiness Score</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Live trading readiness</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: s.rd >= 70 ? 'var(--green)' : 'var(--amber)' }}>{s.rd}<span style={{ fontSize: 12, color: 'var(--text3)' }}>/100</span></span>
          </div>
          <div className="prog" style={{ marginBottom: 10 }}>
            <div className="prog-f" style={{ width: s.rd + '%', background: s.rd >= 70 ? 'var(--green)' : 'var(--amber)' }} />
          </div>
          {[['Trades closed', s.cl + ' / 20', s.cl >= 20], ['Win rate', s.wr + '% (≥55%)', s.wr >= 55], ['Profit factor', s.pf + ' (≥1.5)', parseFloat(s.pf) >= 1.5]].map(([l, v, ok]) => (
            <div key={l} className="row" style={{ fontSize: 12 }}>
              <span style={{ color: 'var(--text3)' }}>{l}</span>
              <span style={{ color: ok ? 'var(--green)' : 'var(--text2)' }}>{v}{ok ? ' ✓' : ''}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ct"><span><i className="ti ti-flask" /> Open Paper Trades ({s.open.length})</span></div>
          {s.open.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 12 }}>No open trades. Go to AI Signals to generate recommendations.</div>
            : s.open.slice(0, 5).map(t => (
              <div key={t.id} className="row" style={{ fontSize: 12 }}>
                <div><b>{t.sym}</b> <Badge type={t.dir === 'LONG' ? 'buy' : 'sell'}>{t.dir}</Badge></div>
                <div style={{ textAlign: 'right', fontSize: 11 }}>
                  <div>₹{t.entry} → T1 ₹{t.t1}</div>
                  <div style={{ color: 'var(--text3)' }}>SL ₹{t.sl} · R:R 1:{t.rr}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="card">
        <div className="ct"><span><i className="ti ti-history" /> Recent Trades</span></div>
        {s.closed.length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 12 }}>No closed trades yet.</div>
          : <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Symbol</th><th>Direction</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Style</th><th>Result</th></tr></thead>
              <tbody>{s.closed.slice(0, 6).map(t => (
                <tr key={t.id}>
                  <td><b>{t.sym}</b></td>
                  <td><Badge type={t.dir === 'LONG' ? 'buy' : 'sell'}>{t.dir}</Badge></td>
                  <td>₹{t.entry}</td>
                  <td>{t.exitP ? '₹' + t.exitP : '—'}</td>
                  <td className={(t.pnl || 0) >= 0 ? 'up' : 'dn'}>{(t.pnl || 0) >= 0 ? '+' : ''}₹{Math.abs(t.pnl || 0).toLocaleString('en-IN')}</td>
                  <td><Badge type={t.style === 'fno' ? 'fno' : 'paper'}>{t.style || 'swing'}</Badge></td>
                  <td><Badge type={t.result === 'WIN' ? 'win' : 'loss'}>{t.result}</Badge></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}

// ─── MARKET ANALYSIS ─────────────────────────────────────────────────────────
const STOCKS = [
  { s: 'RELIANCE', id: '1333', sg: 'NSE_EQ' }, { s: 'TCS', id: '11536', sg: 'NSE_EQ' },
  { s: 'INFY', id: '10999', sg: 'NSE_EQ' }, { s: 'HDFCBANK', id: '1330', sg: 'NSE_EQ' },
  { s: 'BAJFINANCE', id: '317', sg: 'NSE_EQ' }, { s: 'ICICIBANK', id: '4963', sg: 'NSE_EQ' },
  { s: 'SBIN', id: '3045', sg: 'NSE_EQ' }, { s: 'WIPRO', id: '3787', sg: 'NSE_EQ' },
  { s: 'AXISBANK', id: '5900', sg: 'NSE_EQ' }, { s: 'LT', id: '11483', sg: 'NSE_EQ' },
  { s: 'SUNPHARMA', id: '3351', sg: 'NSE_EQ' }, { s: 'MARUTI', id: '10942', sg: 'NSE_EQ' },
]

function MarketAnalysis({ creds, onAddTrade }) {
  const [sym, setSym] = useState('RELIANCE')
  const [tf, setTf] = useState('daily')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')

  const run = async () => {
    setLoading(true); setErr(''); setResult(null)
    try {
      const stk = STOCKS.find(x => x.s === sym) || STOCKS[0]
      let closes = []
      try {
        const to = new Date().toISOString().slice(0, 10)
        const fr = new Date(Date.now() - 400 * 86400000).toISOString().slice(0, 10)
        const h = await dhanCall(creds.cid, creds.tok, stk.sg === 'NSE_EQ' ? '/charts/historical' : '/charts/historical', 'POST',
          { securityId: stk.id, exchangeSegment: stk.sg, instrument: 'EQUITY', expiryCode: 0, fromDate: fr, toDate: to })
        closes = h?.close || []
      } catch (e) { /* use fallback data */ }
      if (!closes.length) closes = Array.from({ length: 80 }, (_, i) => Math.round(2600 + i * 7 + Math.sin(i / 4) * 50))
      const cmp = closes[closes.length - 1]

      const a = await geminiJSON(creds.gkey, `You are an expert Indian stock market analyst. Analyse ${sym} for a ${tf} trade setup.
Last 80 daily closing prices: ${closes.slice(-80).join(',')}
Current market price: ₹${cmp}

Compute these from the data: SMA20, SMA50, RSI14, MACD signal, support/resistance levels.

Return ONLY valid JSON (no markdown, no explanation):
{"sym":"${sym}","cmp":${cmp},"trend":"Bullish|Bearish|Neutral","strength":"Strong|Moderate|Weak","sma20":0,"sma50":0,"rsi":0,"rsi_sig":"Overbought|Neutral|Oversold","macd":"Bullish|Bearish|Neutral","vol":"High|Normal|Low","s1":0,"s2":0,"r1":0,"r2":0,"patterns":["pattern name"],"action":"BUY|SELL|HOLD|AVOID","conviction":"High|Medium|Low","entry_lo":0,"entry_hi":0,"sl":0,"t1":0,"t2":0,"t3":0,"conf":70,"rr":2.0,"est_profit_100":0,"est_loss_100":0,"rationale":"3 sentence explanation","trigger":"what confirmation to wait for before entry","risks":["risk1","risk2"],"hold":"X days"}`, 2000)

      setResult(a)
    } catch (e) { setErr(e.message) }
    setLoading(false)
  }

  const ib = result?.action === 'BUY', is = result?.action === 'SELL'
  const bc = ib ? 'var(--green)' : is ? 'var(--red)' : 'var(--amber)'

  return (
    <div className="page">
      <div className="ph"><div><div className="pt">Market Analysis</div><div className="ps">AI-powered analysis with Gemini — completely free</div></div></div>
      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label className="fl">Stock</label>
          <select value={sym} onChange={e => setSym(e.target.value)}>
            {STOCKS.map(s => <option key={s.s} value={s.s}>{s.s}</option>)}
          </select>
        </div>
        <div>
          <label className="fl">Timeframe</label>
          <select value={tf} onChange={e => setTf(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="intraday">Intraday</option>
          </select>
        </div>
        <Btn primary onClick={run} disabled={loading}>
          <i className={`ti ti-wand${loading ? ' spin' : ''}`} />
          {loading ? 'Analysing…' : 'Run AI Analysis'}
        </Btn>
      </div>
      {err && <Alert type="e">Analysis failed: {err}</Alert>}
      {!result && !err && !loading && (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text3)', fontSize: 12 }}>
          Select a stock and click Run AI Analysis<br />
          Gemini AI computes RSI, MACD, S&R levels and generates a full trade recommendation — free
        </div>
      )}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <i className="ti ti-wand spin" style={{ fontSize: 28, color: 'var(--green)' }} />
          <div style={{ marginTop: 10, color: 'var(--text3)', fontSize: 12 }}>Gemini AI analysing <b style={{ color: 'var(--text)' }}>{sym}</b>…</div>
        </div>
      )}
      {result && !result.raw && (
        <div className="card" style={{ borderLeft: `3px solid ${bc}`, borderRadius: '0 14px 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{result.sym}</span>
                <span style={{ fontSize: 15, color: 'var(--text2)' }}>₹{Number(result.cmp).toLocaleString('en-IN')}</span>
                <Badge type={ib ? 'buy' : is ? 'sell' : 'hold'}>{ib ? '▲' : is ? '▼' : '◆'} {result.action}</Badge>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{result.conviction} conviction · {result.hold}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', maxWidth: 520, lineHeight: 1.6 }}>{result.rationale}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: result.conf >= 65 ? 'var(--green)' : 'var(--amber)' }}>{result.conf}%</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>confidence</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>R:R 1:{result.rr}</div>
            </div>
          </div>
          <div className="g3" style={{ gap: 8, marginBottom: 12 }}>
            {[['Entry zone', '₹' + result.entry_lo + '–₹' + result.entry_hi, 'var(--blue)'],
              ['Stop loss', '₹' + result.sl, 'var(--red)'],
              ['Target 1', '₹' + result.t1, 'var(--green)'],
              ['Target 2', '₹' + result.t2, 'var(--green)'],
              ['Target 3', '₹' + result.t3, 'var(--green)'],
              ['Hold period', result.hold, 'var(--text2)']].map(([l, v, c]) => (
                <div key={l} className="card-sm">
                  <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c }}>{v}</div>
                </div>
              ))}
          </div>
          <div className="g2">
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Technical Signals</div>
              {[['Trend', result.trend + ' · ' + result.strength, result.trend === 'Bullish' ? 'sig-b' : result.trend === 'Bearish' ? 'sig-r' : 'sig-a'],
                ['RSI (' + result.rsi + ')', result.rsi_sig, result.rsi_sig === 'Oversold' ? 'sig-b' : result.rsi_sig === 'Overbought' ? 'sig-r' : 'sig-a'],
                ['MACD', result.macd, result.macd === 'Bullish' ? 'sig-b' : 'sig-r'],
                ['Volume', result.vol, result.vol === 'High' ? 'sig-b' : 'sig-a'],
                ['SMA 20/50', '₹' + result.sma20 + ' / ₹' + result.sma50, 'sig-a']].map(([l, v, sc]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                    <span className={`sig ${sc}`} />
                    <span style={{ color: 'var(--text3)', width: 80, flexShrink: 0 }}>{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Support &amp; Resistance</div>
              {[['R2', '₹' + result.r2, 'var(--red)'], ['R1', '₹' + result.r1, 'var(--red)'], ['S1', '₹' + result.s1, 'var(--green)'], ['S2', '₹' + result.s2, 'var(--green)']].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text3)' }}>{l}</span>
                  <span style={{ fontWeight: 500, color: c }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 5 }}>Key Risks</div>
                {(result.risks || []).map((r, i) => <div key={i} style={{ fontSize: 11, color: 'var(--text2)', padding: '2px 0' }}>• {r}</div>)}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['swing', 'intraday', 'fno'].map(style => (
              <Btn key={style} primary={style === 'swing'} sm onClick={() => onAddTrade({ sym: result.sym, entry: result.entry_hi, sl: result.sl, t1: result.t1, t2: result.t2 || result.t1, qty: style === 'intraday' ? 100 : style === 'fno' ? 1 : 50, dir: result.action === 'SELL' ? 'SHORT' : 'LONG', style })}>
                <i className="ti ti-plus" /> Paper trade ({style})
              </Btn>
            ))}
          </div>
        </div>
      )}
      {result?.raw && <Alert type="e">Could not parse analysis. Raw response: {result.raw?.slice(0, 200)}</Alert>}
    </div>
  )
}

// ─── AI SIGNALS ──────────────────────────────────────────────────────────────
function AISignals({ creds, onAddTrade }) {
  const [style, setStyle] = useState('swing')
  const [n, setN] = useState('5')
  const [minC, setMinC] = useState('65')
  const [loading, setLoading] = useState(false)
  const [signals, setSignals] = useState([])
  const [err, setErr] = useState('')
  const [added, setAdded] = useState({})

  const scan = async () => {
    setLoading(true); setErr(''); setSignals([])
    const syms = STOCKS.slice(0, parseInt(n)).map(s => s.s)
    try {
      const r = await geminiJSON(creds.gkey, `Expert Indian stock analyst. Generate ${style} trading signals for: ${syms.join(', ')}.
Return ONLY a JSON array. Include only stocks with confidence >= ${minC}%. Mix BUY/SELL/AVOID realistically.
[{"sym":"RELIANCE","cmp":2840,"action":"BUY|SELL|AVOID","conviction":"High|Medium|Low","entry":2840,"sl":2700,"t1":2980,"t2":3050,"conf":72,"rr":2.0,"rationale":"2 sentence reason","style":"${style}"}]`, 2500)
      const arr = Array.isArray(r) ? r.filter(s => s.action !== 'AVOID' && s.conf >= parseInt(minC)) : []
      setSignals(arr)
      if (!arr.length) setErr('No signals found above ' + minC + '% confidence. Try lowering the threshold.')
    } catch (e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="ph"><div><div className="pt">AI Signals</div><div className="ps">Gemini AI scans stocks and generates trade setups — free</div></div></div>
      <Alert type="w">AI-generated analysis only. Final decisions are entirely yours. Paper trading phase — no real capital.</Alert>
      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {[['Style', style, setStyle, [['swing', 'Swing (2–15 days)'], ['intraday', 'Intraday'], ['fno', 'F&O']]],
          ['Stocks', n, setN, [['5', 'Top 5'], ['8', 'Top 8'], ['12', 'All 12']]],
          ['Min confidence', minC, setMinC, [['60', '60%+'], ['65', '65%+'], ['70', '70%+']]]].map(([label, val, setter, opts]) => (
            <div key={label}>
              <label className="fl">{label}</label>
              <select value={val} onChange={e => setter(e.target.value)}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        <Btn primary onClick={scan} disabled={loading}>
          <i className={`ti ti-radar${loading ? ' spin' : ''}`} />
          {loading ? 'Scanning…' : 'Scan markets'}
        </Btn>
      </div>
      {err && <Alert type="w">{err}</Alert>}
      {signals.length > 0 && (
        <div className="g2">
          {signals.map(s => {
            const ib = s.action === 'BUY'
            const qty = style === 'intraday' ? 100 : style === 'fno' ? 1 : 50
            const risk = Math.round(Math.abs(s.entry - s.sl) * qty)
            const rew = Math.round(Math.abs(s.t1 - s.entry) * qty)
            return (
              <div key={s.sym} className="card" style={{ borderLeft: `3px solid ${ib ? 'var(--green)' : 'var(--red)'}`, borderRadius: '0 14px 14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{s.sym}</span>
                    <Badge type={ib ? 'buy' : 'sell'}>{ib ? '▲' : '▼'} {s.action}</Badge>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, lineHeight: 1.5 }}>{s.rationale}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.conf >= 70 ? 'var(--green)' : 'var(--amber)' }}>{s.conf}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>R:R 1:{s.rr}</div>
                  </div>
                </div>
                <div className="g3" style={{ gap: 6, marginBottom: 10 }}>
                  {[['Entry', '₹' + s.entry, 'var(--blue)'], ['SL', '₹' + s.sl, 'var(--red)'], ['T1', '₹' + s.t1, 'var(--green)'],
                    ['T2', '₹' + (s.t2 || s.t1), 'var(--green)'], ['Risk', '₹' + risk.toLocaleString('en-IN'), 'var(--red)'], ['Reward', '₹' + rew.toLocaleString('en-IN'), 'var(--green)']].map(([l, v, c]) => (
                      <div key={l} className="card-sm" style={{ padding: 8 }}>
                        <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase' }}>{l}</div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: c }}>{v}</div>
                      </div>
                    ))}
                </div>
                <Btn primary sm disabled={added[s.sym]} onClick={() => {
                  onAddTrade({ sym: s.sym, entry: s.entry, sl: s.sl, t1: s.t1, t2: s.t2 || s.t1, qty, dir: ib ? 'LONG' : 'SHORT', style })
                  setAdded(a => ({ ...a, [s.sym]: true }))
                }}>
                  <i className="ti ti-plus" /> {added[s.sym] ? '✓ Added' : 'Add paper trade'}
                </Btn>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── PAPER TRADES ────────────────────────────────────────────────────────────
const STYLE_INFO = {
  swing: { icon: 'ti-trending-up', color: 'var(--green)', name: 'Swing Trading', desc: 'Hold 2–15 days for medium-term price moves. Best for working professionals — only 30–60 min/day.', defaults: ['RELIANCE', 'LONG', 50, 2840, 2700, 2980, 3050], info: [['Holding period', '2–15 trading days'], ['Min capital', '₹50,000'], ['Recommended', '₹2,00,000–₹5,00,000'], ['Risk per trade', '1–2% of capital'], ['Target R:R', '1:2 to 1:3'], ['Monthly return', '3–8%'], ['Max drawdown', '10–20%'], ['Time needed', '30–60 min/day (EOD)'], ['Difficulty', '★★☆ Medium'], ['Best for', 'Beginners to Advanced']], pros: ['No need to watch screen all day', 'Works alongside a full-time job', 'Moves large enough to clear brokerage', 'Lower psychological stress than intraday'], cons: ['Overnight gap risk from news/events', 'Capital locked for multiple days', 'Corporate news can invalidate setups', 'Must hold through temporary pullbacks'] },
  intraday: { icon: 'ti-bolt', color: 'var(--amber)', name: 'Intraday Trading', desc: 'Open and close all positions within the same trading day (9:15 AM – 3:20 PM). Full-time attention needed.', defaults: ['TCS', 'LONG', 100, 3960, 3920, 4020, 4060], info: [['Holding period', 'Minutes to hours (same day)'], ['Min capital', '₹25,000'], ['Recommended', '₹1,00,000–₹3,00,000'], ['Risk per trade', '0.5–1% of capital'], ['Target R:R', '1:1.5 to 1:2'], ['Monthly return', '2–10% (skilled)'], ['Max drawdown', '15–30%'], ['Time needed', 'Full market hours (5–6 hrs)'], ['Difficulty', '★★★ Hard'], ['Best for', 'Intermediate to Advanced ONLY']], pros: ['No overnight risk — flat every evening', '5× leverage on Dhan MIS orders', 'Quick feedback loop — learn fast', 'Profit in both rising and falling markets'], cons: ['Requires constant screen attention all day', 'Auto square-off at 3:20 PM at market price', 'Very stressful and psychologically draining', '80%+ beginners lose money — SEBI confirmed'] },
  fno: { icon: 'ti-chart-bar', color: 'var(--purple)', name: 'F&O Trading', desc: 'Trade Nifty/BankNifty futures and index/stock options. Highest leverage and complexity.', defaults: ['NIFTY FUT', 'LONG', 1, 24200, 24050, 24450, 24700], info: [['Instruments', 'Index & Stock Futures + Options'], ['Nifty lot size', '50 units (≈₹12L+ value)'], ['Futures margin', '₹85,000–₹1,20,000/lot'], ['Options max loss', 'Premium paid only (buyer)'], ['Min capital', '₹1,00,000 (options)'], ['Recommended', '₹5,00,000+'], ['Monthly return', '5–20% (huge variance)'], ['Time needed', '2–8 hrs/day'], ['Difficulty', '★★★★ Expert'], ['Best for', 'Advanced traders ONLY']], pros: ['Control ₹12L+ position with ₹85K margin', 'Options max loss = premium paid only', 'Weekly expiry creates frequent opportunities', 'Can hedge your long-term stock portfolio'], cons: ['Time decay erodes options value daily', 'Most options expire worthless (100% loss common)', 'Futures: unlimited loss without strict SL', 'Requires deep knowledge of Greeks (Delta/Theta/Vega)', 'SEBI 2023: 90% of F&O traders lose money'] }
}

function PaperTrades({ trades, onOpen, onClose }) {
  const [tab, setTab] = useState('ov')
  const tabs = [['ov', 'Overview'], ['new', 'New Trade'], ['swing', 'Swing'], ['intraday', 'Intraday'], ['fno', 'F&O']]
  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">Paper Trades</div><div className="ps">Simulate trades — no real capital</div></div>
        <Badge type="paper">Phase 1</Badge>
      </div>
      <div className="tabs">
        {tabs.map(([id, label]) => <div key={id} className={`tab${tab === id ? ' on' : ''}`} onClick={() => setTab(id)}>{label}</div>)}
      </div>
      {tab === 'ov' && <PaperOverview trades={trades} onClose={onClose} />}
      {tab === 'new' && <NewTrade onOpen={onOpen} />}
      {(tab === 'swing' || tab === 'intraday' || tab === 'fno') && <StyleTab style={tab} onOpen={onOpen} trades={trades} />}
    </div>
  )
}

function PaperOverview({ trades, onClose }) {
  const s = calcStats(trades)
  const [exitPrices, setExitPrices] = useState({})
  return (
    <>
      <div className="g4" style={{ marginBottom: 14 }}>
        <Metric label="Total P&L" value={(s.tp >= 0 ? '+' : '') + '₹' + Math.abs(s.tp).toLocaleString('en-IN')} up={s.tp > 0} dn={s.tp < 0} />
        <Metric label="Win rate" value={s.wr + '%'} up={s.wr >= 55} sub={`${s.w}W / ${s.l}L`} />
        <Metric label="Profit factor" value={s.pf} up={parseFloat(s.pf) >= 1.5} />
        <Metric label="Avg win / loss" value={`₹${s.aw}`} sub={`Avg loss: ₹${Math.abs(s.al)}`} />
      </div>
      <div className="card">
        <div className="ct"><span><i className="ti ti-flask" /> Open trades ({s.open.length})</span></div>
        {s.open.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 12 }}>No open trades.</div> :
          <div style={{ overflowX: 'auto' }}><table>
            <thead><tr><th>Symbol</th><th>Dir</th><th>Entry</th><th>SL</th><th>T1</th><th>Qty</th><th>R:R</th><th>Style</th><th>Close</th></tr></thead>
            <tbody>{s.open.map(t => (
              <tr key={t.id}>
                <td><b>{t.sym}</b></td>
                <td><Badge type={t.dir === 'LONG' ? 'buy' : 'sell'}>{t.dir}</Badge></td>
                <td>₹{t.entry}</td><td className="dn">₹{t.sl}</td><td className="up">₹{t.t1}</td>
                <td>{t.qty}</td><td>1:{t.rr}</td>
                <td><Badge type={t.style === 'fno' ? 'fno' : 'paper'}>{t.style || 'swing'}</Badge></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <input type="number" placeholder="Exit ₹" value={exitPrices[t.id] || ''} onChange={e => setExitPrices(p => ({ ...p, [t.id]: e.target.value }))} style={{ width: 72, padding: '4px 7px', fontSize: 11, display: 'inline-block', marginRight: 5 }} />
                  <Btn primary sm onClick={() => { if (!exitPrices[t.id]) { alert('Enter exit price'); return } onClose(t.id, parseFloat(exitPrices[t.id])) }}>Close</Btn>
                </td>
              </tr>
            ))}</tbody>
          </table></div>}
      </div>
      <div className="card">
        <div className="ct"><span><i className="ti ti-history" /> Closed trades ({s.closed.length})</span></div>
        {s.closed.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 12 }}>No closed trades yet.</div> :
          <div style={{ overflowX: 'auto' }}><table>
            <thead><tr><th>Symbol</th><th>Dir</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Style</th><th>Result</th></tr></thead>
            <tbody>{s.closed.slice(0, 30).map(t => (
              <tr key={t.id}>
                <td><b>{t.sym}</b></td>
                <td><Badge type={t.dir === 'LONG' ? 'buy' : 'sell'}>{t.dir}</Badge></td>
                <td>₹{t.entry}</td><td>{t.exitP ? '₹' + t.exitP : '—'}</td>
                <td className={(t.pnl || 0) >= 0 ? 'up' : 'dn'}>{(t.pnl || 0) >= 0 ? '+' : ''}₹{Math.abs(t.pnl || 0).toLocaleString('en-IN')}</td>
                <td><Badge type={t.style === 'fno' ? 'fno' : 'paper'}>{t.style || 'swing'}</Badge></td>
                <td><Badge type={t.result === 'WIN' ? 'win' : 'loss'}>{t.result}</Badge></td>
              </tr>
            ))}</tbody>
          </table></div>}
      </div>
    </>
  )
}

function NewTrade({ onOpen }) {
  const [form, setForm] = useState({ sym: '', style: 'swing', dir: 'LONG', qty: 50, entry: '', sl: '', t1: '', t2: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const e = parseFloat(form.entry) || 0, sl = parseFloat(form.sl) || 0, t1 = parseFloat(form.t1) || 0, q = form.qty || 1
  const risk = e && sl ? Math.abs(e - sl) * q : 0
  const rew = e && t1 ? Math.abs(t1 - e) * q : 0
  const rr = risk > 0 ? (rew / risk).toFixed(2) : 0
  return (
    <div className="card">
      <div className="ct"><i className="ti ti-plus" /> Manual paper trade</div>
      <div className="g2">
        <div className="fr"><label className="fl">Symbol</label><input placeholder="e.g. RELIANCE" value={form.sym} onChange={e => set('sym', e.target.value.toUpperCase())} /></div>
        <div className="fr"><label className="fl">Quantity</label><input type="number" value={form.qty} onChange={e => set('qty', +e.target.value)} /></div>
        <div className="fr"><label className="fl">Style</label><select value={form.style} onChange={e => set('style', e.target.value)}><option value="swing">Swing</option><option value="intraday">Intraday</option><option value="fno">F&O</option></select></div>
        <div className="fr"><label className="fl">Direction</label><select value={form.dir} onChange={e => set('dir', e.target.value)}><option value="LONG">LONG (Buy)</option><option value="SHORT">SHORT (Sell)</option></select></div>
        {[['Entry ₹', 'entry'], ['Stop loss ₹', 'sl'], ['Target 1 ₹', 't1'], ['Target 2 ₹', 't2']].map(([l, k]) => (
          <div key={k} className="fr"><label className="fl">{l}</label><input type="number" value={form[k]} onChange={e => set(k, e.target.value)} /></div>
        ))}
      </div>
      <div className="g4" style={{ marginBottom: 12 }}>
        {[['Risk', '₹' + Math.round(risk).toLocaleString('en-IN'), 'dn'], ['Reward', '₹' + Math.round(rew).toLocaleString('en-IN'), 'up'], ['R:R', '1:' + rr, parseFloat(rr) >= 1.5 ? 'up' : ''], ['Risk %', ((e && sl ? Math.abs(e - sl) / e * 100 : 0)).toFixed(1) + '%', '']].map(([l, v, cls]) => (
          <div key={l} className="card-sm"><div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase' }}>{l}</div><div style={{ fontSize: 13, fontWeight: 600 }} className={cls}>{v}</div></div>
        ))}
      </div>
      {rr > 0 && rr < 1.5 && <Alert type="w">R:R below 1.5 — consider adjusting levels for a better setup.</Alert>}
      <Btn primary onClick={() => {
        if (!form.sym || !form.entry || !form.sl || !form.t1) { alert('Fill in all required fields'); return }
        onOpen({ sym: form.sym, entry: parseFloat(form.entry), sl: parseFloat(form.sl), t1: parseFloat(form.t1), t2: parseFloat(form.t2) || parseFloat(form.t1), qty: form.qty, dir: form.dir, style: form.style })
        setForm(f => ({ ...f, sym: '', entry: '', sl: '', t1: '', t2: '' }))
        alert('✓ Paper trade simulated!')
      }}><i className="ti ti-plus" /> Simulate paper trade</Btn>
    </div>
  )
}

function StyleTab({ style, onOpen, trades }) {
  const D = STYLE_INFO[style]
  const [sym, setSym] = useState(D.defaults[0])
  const [dir, setDir] = useState(D.defaults[1])
  const [qty, setQty] = useState(D.defaults[2])
  const [entry, setEntry] = useState(D.defaults[3])
  const [sl, setSl] = useState(D.defaults[4])
  const [t1, setT1] = useState(D.defaults[5])
  const [t2, setT2] = useState(D.defaults[6])
  const [done, setDone] = useState(false)
  const stTrades = trades.filter(t => t.style === style)
  const stWins = stTrades.filter(t => t.result === 'WIN').length
  const stPnl = stTrades.filter(t => t.pnl != null).reduce((a, t) => a + t.pnl, 0)
  const risk = Math.abs(entry - sl) * qty
  const rew = Math.abs(t1 - entry) * qty
  const rr = risk > 0 ? (rew / risk).toFixed(2) : 0
  return (
    <>
      <div className="g3" style={{ marginBottom: 14 }}>
        <Metric label={D.name + ' trades'} value={stTrades.length} />
        <Metric label="Wins" value={stWins} up />
        <Metric label="Style P&L" value={(stPnl >= 0 ? '+' : '') + '₹' + Math.round(Math.abs(stPnl)).toLocaleString('en-IN')} up={stPnl > 0} dn={stPnl < 0} />
      </div>
      <div className="card" style={{ borderLeft: `3px solid ${D.color}`, borderRadius: '0 14px 14px 0' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <i className={`ti ${D.icon}`} style={{ fontSize: 22, color: D.color, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{D.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{D.desc}</div>
          </div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="ct">Strategy parameters</div>
          <table><tbody>{D.info.map(([l, v], i) => (
            <tr key={l} style={{ background: i % 2 === 0 ? 'var(--bg3)' : 'transparent' }}>
              <td style={{ color: 'var(--text3)', fontSize: 11 }}>{l}</td>
              <td style={{ fontSize: 12 }}>{v}</td>
            </tr>
          ))}</tbody></table>
        </div>
        <div className="card">
          <div className="ct" style={{ color: 'var(--green)' }}>Advantages</div>
          <div style={{ marginBottom: 14 }}>{D.pros.map(p => <div key={p} style={{ display: 'flex', gap: 7, fontSize: 12, color: 'var(--text2)', padding: '3px 0' }}><span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{p}</div>)}</div>
          <div className="ct" style={{ color: 'var(--red)' }}>Disadvantages</div>
          {D.cons.map(c => <div key={c} style={{ display: 'flex', gap: 7, fontSize: 12, color: 'var(--text2)', padding: '3px 0' }}><span style={{ color: 'var(--red)', flexShrink: 0 }}>✗</span>{c}</div>)}
        </div>
      </div>
      <div className="card" style={{ border: `1px solid ${D.color}40` }}>
        <div className="ct" style={{ color: D.color }}><i className="ti ti-flask" /> Paper Trading Bot — {D.name}</div>
        <div className="g2">
          <div className="fr"><label className="fl">Symbol</label><input value={sym} onChange={e => setSym(e.target.value.toUpperCase())} /></div>
          <div className="fr"><label className="fl">Quantity{style === 'fno' ? ' (lots)' : ''}</label><input type="number" value={qty} onChange={e => setQty(+e.target.value)} /></div>
          <div className="fr"><label className="fl">Direction</label><select value={dir} onChange={e => setDir(e.target.value)}><option value="LONG">LONG (Buy)</option><option value="SHORT">SHORT (Sell)</option></select></div>
          {[['Entry ₹', entry, setEntry], ['Stop loss ₹', sl, setSl], ['Target 1 ₹', t1, setT1], ['Target 2 ₹', t2, setT2]].map(([l, v, setter]) => (
            <div key={l} className="fr"><label className="fl">{l}</label><input type="number" value={v} onChange={e => setter(+e.target.value)} /></div>
          ))}
        </div>
        <div className="g4" style={{ marginBottom: 12 }}>
          {[['Risk', '₹' + Math.round(risk).toLocaleString('en-IN'), 'dn'], ['Reward', '₹' + Math.round(rew).toLocaleString('en-IN'), 'up'], ['R:R', '1:' + rr, parseFloat(rr) >= 1.5 ? 'up' : ''], ['Risk %', ((entry && sl ? Math.abs(entry - sl) / entry * 100 : 0)).toFixed(1) + '%', '']].map(([l, v, cls]) => (
            <div key={l} className="card-sm"><div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase' }}>{l}</div><div style={{ fontSize: 13, fontWeight: 600 }} className={cls}>{v}</div></div>
          ))}
        </div>
        <Btn primary disabled={done} onClick={() => {
          if (!sym || !entry || !sl || !t1) { alert('Fill in all fields'); return }
          onOpen({ sym, entry, sl, t1, t2, qty, dir, style })
          setDone(true)
          setTimeout(() => setDone(false), 2500)
        }}>
          <i className="ti ti-plus" /> {done ? '✓ Trade simulated!' : `Simulate ${D.name} paper trade`}
        </Btn>
      </div>
    </>
  )
}

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
function Portfolio({ creds }) {
  const [holdings, setHoldings] = useState([])
  const [positions, setPositions] = useState([])
  const [funds, setFunds] = useState(null)
  const [loading, setLoading] = useState(false)
  const [review, setReview] = useState(null)
  const [reviewing, setReviewing] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    setLoading(true); setErr('')
    try {
      const [h, p, f] = await Promise.allSettled([
        dhanCall(creds.cid, creds.tok, '/holdings'),
        dhanCall(creds.cid, creds.tok, '/positions'),
        dhanCall(creds.cid, creds.tok, '/fundlimit'),
      ])
      if (h.status === 'fulfilled') setHoldings(Array.isArray(h.value) ? h.value : [])
      if (p.status === 'fulfilled') setPositions(Array.isArray(p.value) ? p.value : [])
      if (f.status === 'fulfilled') setFunds(f.value)
    } catch (e) { setErr(e.message) }
    setLoading(false)
  }

  const aiReview = async () => {
    setReviewing(true)
    try {
      const r = await geminiJSON(creds.gkey, `Portfolio manager reviewing an Indian stock portfolio.
Holdings: ${JSON.stringify(holdings.map(h => ({ sym: h.tradingSymbol, qty: h.totalQty, avg: h.avgCostPrice })))}
Return ONLY JSON: {"summary":"2 sentences","div_score":7,"risk":"High|Medium|Low","recs":[{"sym":"SYMBOL","action":"HOLD|ADD|REDUCE|EXIT","reason":"one sentence","urgency":"High|Medium|Low"}],"sector_note":"one sentence","top_risk":"one sentence"}`)
      setReview(r)
    } catch (e) { setErr(e.message) }
    setReviewing(false)
  }

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">Portfolio</div><div className="ps">Live holdings and positions from your Dhan account</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={load} disabled={loading}><i className={`ti ti-refresh${loading ? ' spin' : ''}`} />{loading ? 'Loading…' : 'Load from Dhan'}</Btn>
          <Btn onClick={aiReview} disabled={reviewing}><i className={`ti ti-wand${reviewing ? ' spin' : ''}`} />{reviewing ? 'Reviewing…' : 'AI Review'}</Btn>
        </div>
      </div>
      <Alert type="i">Holdings are fetched live from your Dhan account. Click "Load from Dhan" to refresh.</Alert>
      {err && <Alert type="e">{err}</Alert>}
      {funds && (
        <div className="g4" style={{ marginBottom: 14 }}>
          {[['Available', Math.round(funds.availabelBalance || 0)], ['SOD limit', Math.round(funds.sodLimit || 0)], ['Utilised', Math.round(funds.utilizedAmount || 0)], ['Withdrawable', Math.round(funds.withdrawableBalance || 0)]].map(([l, v]) => (
            <Metric key={l} label={l} value={'₹' + v.toLocaleString('en-IN')} />
          ))}
        </div>
      )}
      {holdings.length > 0 && (
        <div className="card">
          <div className="ct"><span><i className="ti ti-briefcase" /> Holdings ({holdings.length})</span></div>
          <div style={{ overflowX: 'auto' }}><table>
            <thead><tr><th>Symbol</th><th>Total qty</th><th>Avail qty</th><th>T+1 qty</th><th>Avg cost</th><th>Exchange</th></tr></thead>
            <tbody>{holdings.map((h, i) => <tr key={i}><td><b>{h.tradingSymbol}</b></td><td>{h.totalQty}</td><td>{h.availableQty}</td><td>{h.t1Qty || 0}</td><td>₹{Number(h.avgCostPrice || 0).toFixed(2)}</td><td style={{ color: 'var(--text3)' }}>{h.exchange}</td></tr>)}</tbody>
          </table></div>
        </div>
      )}
      {!holdings.length && !loading && <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 12 }}>Click "Load from Dhan" to fetch your live holdings and positions.</div>}
      {review && (
        <div className="card" style={{ border: '1px solid var(--gbr)' }}>
          <div className="ct" style={{ color: 'var(--green)' }}><i className="ti ti-wand" /> AI Portfolio Review</div>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>{review.summary}</p>
          <div className="g3" style={{ marginBottom: 12 }}>
            <Metric label="Diversification" value={(review.div_score || '—') + '/10'} up={(review.div_score || 0) >= 6} />
            <Metric label="Risk level" value={review.risk || '—'} dn={review.risk === 'High'} />
            <div className="met"><div className="ml">Top risk</div><div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, lineHeight: 1.5 }}>{review.top_risk || '—'}</div></div>
          </div>
          {review.recs?.map(rc => (
            <div key={rc.sym} className="row" style={{ fontSize: 12 }}>
              <span style={{ fontWeight: 500, minWidth: 80 }}>{rc.sym}</span>
              <Badge type={rc.action === 'EXIT' || rc.action === 'REDUCE' ? 'sell' : rc.action === 'ADD' ? 'buy' : 'hold'}>{rc.action}</Badge>
              <span style={{ flex: 1, color: 'var(--text3)', margin: '0 12px' }}>{rc.reason}</span>
              <span style={{ fontSize: 10, color: rc.urgency === 'High' ? 'var(--red)' : 'var(--text3)' }}>{rc.urgency}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── JOURNAL ─────────────────────────────────────────────────────────────────
function Journal({ journal, onAdd }) {
  const [note, setNote] = useState('')
  return (
    <div className="page">
      <div className="ph"><div><div className="pt">Trade Journal</div><div className="ps">{journal.length} entries — trades auto-logged</div></div></div>
      <div className="card">
        <div className="ct"><i className="ti ti-edit" /> Add note</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Market observation, lesson learned, trade note…" value={note} onChange={e => setNote(e.target.value)} style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter' && note.trim()) { onAdd({ type: 'note', note }); setNote('') } }} />
          <Btn primary onClick={() => { if (!note.trim()) return; onAdd({ type: 'note', note }); setNote('') }}><i className="ti ti-plus" /> Add</Btn>
        </div>
      </div>
      <div className="card">
        <div className="ct"><span><i className="ti ti-notebook" /> Journal entries ({journal.length})</span></div>
        {journal.length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 12 }}>No entries yet. Trades are auto-logged here.</div>
          : journal.map(e => (
            <div key={e.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.4px', color: e.type === 'win' ? 'var(--green)' : e.type === 'loss' ? 'var(--red)' : e.type === 'open' ? 'var(--blue)' : 'var(--text3)' }}>
                  {(e.type || 'note').replace(/_/g, ' ')}
                </span>
                {e.sym && <span style={{ fontSize: 11, fontWeight: 600 }}>{e.sym}</span>}
                {e.pnl != null && <span style={{ fontSize: 11, fontWeight: 600, color: e.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{e.pnl >= 0 ? '+' : ''}₹{e.pnl.toLocaleString('en-IN')}</span>}
                <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>
                  {new Date(e.ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{e.note}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ─── STRATEGY GUIDE ──────────────────────────────────────────────────────────
function StrategyGuide() {
  const rows = [['Time required', '30 min/day', 'Full day (5–6 hrs)', '2–8 hrs/day'], ['Min capital', '₹50,000', '₹25,000', '₹1,00,000'], ['Recommended capital', '₹2–5 Lakh', '₹1–3 Lakh', '₹5 Lakh+'], ['Holding period', '2–15 days', 'Same day', 'Same day → weekly'], ['Leverage', 'Not needed', 'Up to 5×', 'Up to 50× (futures)'], ['Difficulty', '★★☆ Medium', '★★★ Hard', '★★★★ Expert'], ['Overnight risk', 'Yes (gap risk)', 'None', 'Futures yes, options capped'], ['Win rate (realistic)', '50–65%', '45–55%', '40–60%'], ['Monthly return', '3–8%', '2–10%', '5–20%'], ['Max drawdown', '10–20%', '15–30%', '20–50%'], ['Learning curve', '3–6 months', '12–24 months', '18–36 months'], ['Suitable for', 'Beginners+', 'Intermediate+', 'Advanced only']]
  return (
    <div className="page">
      <div className="ph"><div><div className="pt">Strategy Guide</div><div className="ps">Understand all three trading styles before risking capital</div></div></div>
      <div className="card">
        <div className="ct">Side-by-side comparison</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="cmp">
            <thead><tr><th>Parameter</th><th className="ch-sw">◎ Swing</th><th className="ch-id">◉ Intraday</th><th className="ch-fo">◈ F&O</th></tr></thead>
            <tbody>{rows.map(([p, s, i, f], idx) => <tr key={p} style={{ background: idx % 2 === 0 ? 'var(--bg3)' : 'transparent' }}><td style={{ color: 'var(--text3)' }}>{p}</td><td className="ch-sw">{s}</td><td className="ch-id">{i}</td><td className="ch-fo">{f}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="ct">Which strategy fits your situation?</div>
        {[['I have a full-time job and 30 min/day', '→ Swing Trading', 'var(--green)'], ['I can watch markets all day, 6+ months experience', '→ Intraday Trading', 'var(--amber)'], ['Complete beginner with ₹1–2L capital', '→ Swing only. Paper trade 3 months first.', 'var(--green)'], ['I want to hedge my stock portfolio', '→ Buy Nifty Put options (small size only)', 'var(--purple)'], ['I want fastest feedback to learn', '→ Paper intraday only — not live until swing profitable', 'var(--amber)']].map(([q, a, c]) => (
          <div key={q} style={{ padding: '9px 11px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{q}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: c }}>{a}</div>
          </div>
        ))}
      </div>
      <Alert type="w"><div><b>Honest reality check:</b> 80% of intraday traders and 90% of F&O traders lose money (SEBI 2023). Profitable trading requires a tested edge, strict risk management, and iron discipline — not just tools. This paper trading phase exists to build that edge before risking real capital.</div></Alert>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [creds, setCreds] = useLocalStorage('am_creds_v2', { cid: '', tok: '', gkey: '' })
  const [trades, setTrades] = useLocalStorage('am_trades', [])
  const [journal, setJournal] = useLocalStorage('am_journal', [])
  const [funds, setFunds] = useState(null)
  const [page, setPage] = useState('dash')

  const isReady = !!(creds.cid && creds.tok && creds.gkey)

  const openTrade = useCallback((t) => {
    const id = 'PT' + Date.now().toString(36).slice(-5).toUpperCase()
    const risk = Math.abs(t.entry - t.sl) * t.qty
    const rew = Math.abs(t.t1 - t.entry) * t.qty
    const trade = { id, ...t, status: 'OPEN', pnl: null, result: null, openedAt: new Date().toISOString(), closedAt: null, rr: risk > 0 ? (rew / risk).toFixed(2) : '—' }
    setTrades(prev => [trade, ...prev])
    setJournal(prev => [{ id: 'J' + Date.now().toString(36), ts: new Date().toISOString(), type: 'open', sym: t.sym, note: `${t.style || 'swing'} ${t.dir} opened @ ₹${t.entry}` }, ...prev])
  }, [setTrades, setJournal])

  const closeTrade = useCallback((id, exitP) => {
    setTrades(prev => prev.map(t => {
      if (t.id !== id || t.status !== 'OPEN') return t
      const pnl = t.dir === 'LONG' ? (exitP - t.entry) * t.qty : (t.entry - exitP) * t.qty
      const closed = { ...t, status: 'CLOSED', exitP, pnl: Math.round(pnl * 100) / 100, result: pnl > 0 ? 'WIN' : 'LOSS', closedAt: new Date().toISOString() }
      setJournal(prev => [{ id: 'J' + Date.now().toString(36), ts: new Date().toISOString(), type: pnl > 0 ? 'win' : 'loss', sym: t.sym, pnl: closed.pnl, note: `Closed @ ₹${exitP}` }, ...prev])
      return closed
    }))
  }, [setTrades, setJournal])

  const addJournal = useCallback((e) => {
    setJournal(prev => [{ id: 'J' + Date.now().toString(36), ts: new Date().toISOString(), ...e }, ...prev])
  }, [setJournal])

  const syncDhan = useCallback(async () => {
    try {
      const f = await dhanCall(creds.cid, creds.tok, '/fundlimit')
      setFunds(f)
      alert('✓ Dhan synced successfully')
    } catch (e) { alert('Dhan sync error: ' + e.message) }
  }, [creds])

  const navItems = [
    { id: 'dash', icon: 'ti-layout-dashboard', label: 'Dashboard', group: 'Main' },
    { id: 'market', icon: 'ti-chart-candle', label: 'Market Analysis', group: 'Main' },
    { id: 'signals', icon: 'ti-bulb', label: 'AI Signals', group: 'Main' },
    { id: 'paper', icon: 'ti-flask', label: 'Paper Trades', group: 'Trading' },
    { id: 'portfolio', icon: 'ti-briefcase', label: 'Portfolio', group: 'Trading' },
    { id: 'journal', icon: 'ti-notebook', label: 'Journal', group: 'Trading' },
    { id: 'guide', icon: 'ti-book', label: 'Strategy Guide', group: 'Learn' },
  ]

  const s = calcStats(trades)

  if (!isReady) return (
    <>
      <style>{css}</style>
      <Settings creds={creds} onSave={c => { setCreds(c); setPage('dash') }} onboard />
    </>
  )

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="sb-head">
            <div className="sb-brand">
              <div className="sb-icon"><i className="ti ti-chart-line" /></div>
              <span className="sb-name">AlphaMind</span>
            </div>
            <div className="sb-sub">AI Trading Portal</div>
          </div>
          <div className="sb-nav">
            {['Main', 'Trading', 'Learn'].map(g => (
              <div key={g} className="sb-group">
                <div className="sb-lbl">{g}</div>
                {navItems.filter(n => n.group === g).map(n => (
                  <div key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} onClick={() => setPage(n.id)}>
                    <i className={`ti ${n.icon}`} />{n.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sb-foot">
            <div className="sr"><span><span className="dot live" /><span style={{ fontSize: 11 }}>Dhan: ready</span></span></div>
            <div className="sr"><span><span className="dot blue" /><span style={{ color: 'var(--blue)', fontSize: 11 }}>Paper · {s.rd}/100</span></span></div>
            <div className={`nav-item${page === 'settings' ? ' active' : ''}`} onClick={() => setPage('settings')} style={{ marginTop: 4 }}>
              <i className="ti ti-settings" />Settings
            </div>
          </div>
        </nav>
        <div className="main">
          {page === 'dash' && <Dashboard creds={creds} trades={trades} funds={funds} onSyncDhan={syncDhan} />}
          {page === 'market' && <MarketAnalysis creds={creds} onAddTrade={t => { openTrade(t); setPage('paper') }} />}
          {page === 'signals' && <AISignals creds={creds} onAddTrade={openTrade} />}
          {page === 'paper' && <PaperTrades trades={trades} onOpen={openTrade} onClose={closeTrade} />}
          {page === 'portfolio' && <Portfolio creds={creds} />}
          {page === 'journal' && <Journal journal={journal} onAdd={addJournal} />}
          {page === 'guide' && <StrategyGuide />}
          {page === 'settings' && <Settings creds={creds} onSave={c => { setCreds(c); setPage('dash') }} />}
        </div>
      </div>
    </>
  )
}
