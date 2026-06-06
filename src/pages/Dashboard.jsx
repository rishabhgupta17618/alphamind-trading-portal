import React, { useState, useEffect } from 'react'
import { dhan } from '../utils/dhan.js'

export default function Dashboard({ creds, trades, funds, setFunds, setHoldings, setPositions, onNavigate }) {
  const [syncing, setSyncing] = useState(false)
  const [syncErr, setSyncErr] = useState('')
  const [syncOk, setSyncOk] = useState(false)

  const closed  = trades.filter(t => t.status === 'CLOSED')
  const open    = trades.filter(t => t.status === 'OPEN')
  const wins    = closed.filter(t => t.result === 'WIN')
  const losses  = closed.filter(t => t.result === 'LOSS')
  const totalPnl = closed.reduce((s, t) => s + (t.pnl || 0), 0)
  const wr      = closed.length ? Math.round(wins.length / closed.length * 100) : 0
  const wp      = wins.reduce((s,t) => s+(t.pnl||0), 0)
  const lp      = Math.abs(losses.reduce((s,t) => s+(t.pnl||0), 0))
  const pf      = lp > 0 ? (wp/lp).toFixed(2) : wins.length > 0 ? '∞' : '0'
  const rd      = Math.min(100, Math.round(
    (Math.min(closed.length/20,1)*25) +
    (closed.length ? Math.min(wr/55,1)*25 : 0) +
    (lp>0 ? Math.min(wp/lp/1.5,1)*25 : wins.length?25:0) + 25
  ))

  const syncDhan = async () => {
    setSyncing(true); setSyncErr(''); setSyncOk(false)
    try {
      const [f, h, p] = await Promise.allSettled([
        dhan.funds(creds.cid, creds.tok),
        dhan.holdings(creds.cid, creds.tok),
        dhan.positions(creds.cid, creds.tok),
      ])
      if (f.status === 'fulfilled') setFunds(f.value)
      if (h.status === 'fulfilled') setHoldings(Array.isArray(h.value) ? h.value : [])
      if (p.status === 'fulfilled') setPositions(Array.isArray(p.value) ? p.value : [])
      setSyncOk(true)
      setTimeout(() => setSyncOk(false), 3000)
    } catch (e) {
      setSyncErr(e.message)
    }
    setSyncing(false)
  }

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="pt">Dashboard</div>
          <div className="ps">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
        </div>
        <button className="btn" onClick={syncDhan} disabled={syncing}>
          <i className={`ti ti-refresh${syncing?' spin':''}`} />
          {syncing ? 'Syncing…' : 'Sync Dhan'}
        </button>
      </div>

      {syncErr && <div className="al al-e"><i className="ti ti-alert-circle"/>Sync failed: {syncErr} — <span style={{textDecoration:'underline',cursor:'pointer'}} onClick={()=>setSyncErr('')}>dismiss</span></div>}
      {syncOk  && <div className="al al-s"><i className="ti ti-check"/>Dhan account synced successfully</div>}

      <div className="al al-i">
        <i className="ti ti-flask"/>
        <span><b>Paper Trading Phase Active</b> — All recommendations are simulated. No real capital at risk. Readiness score: <b>{rd}/100</b></span>
      </div>

      <div className="g4" style={{marginBottom:14}}>
        <div className="met"><div className="ml">Available Balance</div><div className="mv">{funds?'₹'+Math.round(funds.availabelBalance||0).toLocaleString('en-IN'):'—'}</div><div className="ms">Tap Sync Dhan</div></div>
        <div className="met"><div className="ml">Paper P&L</div><div className={`mv ${totalPnl>=0?'up':'dn'}`}>{totalPnl>=0?'+':''}₹{Math.abs(Math.round(totalPnl)).toLocaleString('en-IN')}</div><div className="ms">{wins.length}W · {losses.length}L</div></div>
        <div className="met"><div className="ml">Win Rate</div><div className={`mv ${wr>=55?'up':''}`}>{wr}%</div><div className="ms">Target ≥55%</div></div>
        <div className="met"><div className="ml">Profit Factor</div><div className={`mv ${parseFloat(pf)>=1.5?'up':''}`}>{pf}</div><div className="ms">Target ≥1.5</div></div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="ct"><span><i className="ti ti-shield-check"/> Readiness Score</span></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
            <span style={{fontSize:12,color:'var(--text2)'}}>Live trading readiness</span>
            <span style={{fontSize:22,fontWeight:700,color:rd>=70?'var(--green)':'var(--amber)'}}>{rd}<span style={{fontSize:12,color:'var(--text3)'}}>/100</span></span>
          </div>
          <div className="prog" style={{marginBottom:10}}><div className="prog-f" style={{width:rd+'%',background:rd>=70?'var(--green)':'var(--amber)'}}/></div>
          {[['Trades closed',closed.length+' / 20',closed.length>=20],['Win rate',wr+'% (≥55%)',wr>=55],['Profit factor',pf+' (≥1.5)',parseFloat(pf)>=1.5]].map(([l,v,ok])=>(
            <div key={l} className="row" style={{fontSize:12}}>
              <span style={{color:'var(--text3)'}}>{l}</span>
              <span style={{color:ok?'var(--green)':'var(--text2)'}}>{v}{ok?' ✓':''}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="ct"><span><i className="ti ti-flask"/> Open Paper Trades ({open.length})</span>
            <button className="btn btn-sm" onClick={()=>onNavigate('paper')}>View all →</button>
          </div>
          {open.length===0
            ? <div style={{color:'var(--text3)',fontSize:12}}>No open trades. Go to AI Signals to generate setups.</div>
            : open.slice(0,5).map(t=>(
              <div key={t.id} className="row" style={{fontSize:12}}>
                <div><b>{t.sym}</b> <span className={`bdg b-${t.dir==='LONG'?'buy':'sell'}`}>{t.dir}</span> <span className={`bdg b-${t.style==='fno'?'fno':'paper'}`} style={{fontSize:10}}>{t.style}</span></div>
                <div style={{textAlign:'right',fontSize:11}}>
                  <div>₹{t.entry} → T1 ₹{t.t1}</div>
                  <div style={{color:'var(--text3)'}}>SL ₹{t.sl} · R:R 1:{t.rr}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className="card">
        <div className="ct"><span><i className="ti ti-history"/> Recent Trades</span>
          <button className="btn btn-sm" onClick={()=>onNavigate('paper')}>All trades →</button>
        </div>
        {closed.length===0
          ? <div style={{color:'var(--text3)',fontSize:12}}>No closed trades yet.</div>
          : <div style={{overflowX:'auto'}}>
            <table>
              <thead><tr><th>Symbol</th><th>Dir</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Style</th><th>Type</th><th>Result</th></tr></thead>
              <tbody>{closed.slice(0,8).map(t=>(
                <tr key={t.id}>
                  <td><b>{t.sym}</b></td>
                  <td><span className={`bdg b-${t.dir==='LONG'?'buy':'sell'}`}>{t.dir}</span></td>
                  <td>₹{t.entry}</td>
                  <td>{t.exitP?'₹'+t.exitP:'—'}</td>
                  <td className={(t.pnl||0)>=0?'up':'dn'}>{(t.pnl||0)>=0?'+':''}₹{Math.abs(t.pnl||0).toLocaleString('en-IN')}</td>
                  <td><span className={`bdg b-${t.style==='fno'?'fno':'paper'}`} style={{fontSize:10}}>{t.style||'swing'}</span></td>
                  <td><span className={`bdg`} style={{fontSize:10,background:t.tradeType==='live'?'var(--ab)':'var(--bb)',color:t.tradeType==='live'?'var(--at)':'var(--bt)'}}>{t.tradeType==='live'?'LIVE':'PAPER'}</span></td>
                  <td><span className={`bdg b-${t.result==='WIN'?'win':'loss'}`}>{t.result||'OPEN'}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}
