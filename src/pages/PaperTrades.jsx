import React, { useState } from 'react'
import { geminiJSON } from '../utils/gemini.js'
import { STOCKS } from '../utils/dhan.js'

const STYLE_INFO = {
  swing: {
    icon:'ti-trending-up', color:'var(--green)', name:'Swing Trading',
    desc:'Hold 2–15 days for medium-term moves. Best for working professionals — 30–60 min/day only.',
    defaults:['RELIANCE','LONG',50,2840,2700,2980,3050],
    info:[['Holding period','2–15 trading days'],['Min capital','₹50,000'],['Recommended','₹2L–₹5L'],['Risk per trade','1–2% of capital'],['Target R:R','1:2 to 1:3'],['Monthly return','3–8%'],['Max drawdown','10–20%'],['Time needed','30–60 min/day'],['Difficulty','★★☆ Medium'],['Best for','Beginners to Advanced']],
    pros:['No need to watch screen all day','Works alongside a full-time job','Large moves clear brokerage costs','Lower stress than intraday'],
    cons:['Overnight gap risk from news/events','Capital locked for multiple days','Corporate news can invalidate setup','Must hold through pullbacks']
  },
  intraday: {
    icon:'ti-bolt', color:'var(--amber)', name:'Intraday Trading',
    desc:'Open and close all positions within the same trading day. Full-time screen attention required.',
    defaults:['TCS','LONG',100,3960,3920,4020,4060],
    info:[['Holding period','Minutes to hours (same day)'],['Min capital','₹25,000'],['Recommended','₹1L–₹3L'],['Risk per trade','0.5–1% of capital'],['Target R:R','1:1.5 to 1:2'],['Monthly return','2–10% (skilled)'],['Max drawdown','15–30%'],['Time needed','Full market hours (5–6 hrs)'],['Difficulty','★★★ Hard'],['Best for','Intermediate to Advanced']],
    pros:['No overnight risk — flat every evening','5× leverage on Dhan MIS','Quick feedback loop','Profit in both directions'],
    cons:['Constant screen attention required','Auto square-off at 3:20 PM','Extremely stressful','80%+ beginners lose money (SEBI data)']
  },
  fno: {
    icon:'ti-chart-bar', color:'var(--purple)', name:'F&O Trading',
    desc:'Trade Nifty/BankNifty futures and options. Highest leverage, highest complexity.',
    defaults:['NIFTY FUT','LONG',1,24200,24050,24450,24700],
    info:[['Instruments','Index & Stock Futures + Options'],['Nifty lot size','50 units (≈₹12L+)'],['Futures margin','₹85K–₹1.2L/lot'],['Options max loss','Premium only (buyer)'],['Min capital','₹1L (options)'],['Recommended','₹5L+'],['Monthly return','5–20% (huge variance)'],['Time needed','2–8 hrs/day'],['Difficulty','★★★★ Expert'],['Best for','Advanced traders ONLY']],
    pros:['High leverage — control ₹12L with ₹85K','Options max loss = premium paid','Weekly expiry opportunities','Hedge stock portfolio with puts'],
    cons:['Time decay erodes option value daily','Most options expire worthless','Futures: unlimited loss without SL','Requires deep knowledge of Greeks','SEBI 2023: 90% of F&O traders lose money']
  }
}

function RRCalc({ entry, sl, t1, qty }) {
  const e=parseFloat(entry)||0, s=parseFloat(sl)||0, t=parseFloat(t1)||0, q=parseInt(qty)||1
  if (!e||!s||!t) return null
  const risk=Math.abs(e-s)*q, rew=Math.abs(t-e)*q, rr=risk>0?(rew/risk).toFixed(2):0
  const riskPct=((Math.abs(e-s)/e)*100).toFixed(1)
  return (
    <div className="g4" style={{marginBottom:10}}>
      {[['Risk','₹'+Math.round(risk).toLocaleString('en-IN'),'dn'],
        ['Reward T1','₹'+Math.round(rew).toLocaleString('en-IN'),'up'],
        ['R:R','1:'+rr,parseFloat(rr)>=1.5?'up':''],
        ['Risk %',riskPct+'%',parseFloat(riskPct)<=2?'up':'dn']].map(([l,v,cls])=>(
        <div key={l} className="card-sm">
          <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase'}}>{l}</div>
          <div style={{fontSize:13,fontWeight:600}} className={cls}>{v}</div>
        </div>
      ))}
      {parseFloat(rr)<1.5 && <div className="al al-w" style={{gridColumn:'1/-1',marginBottom:0}}><i className="ti ti-alert-triangle"/>R:R below 1.5 — consider adjusting levels for a better setup before trading.</div>}
    </div>
  )
}

function OverviewTab({ trades, onClose }) {
  const [exitPrices, setExitPrices] = useState({})
  const closed = trades.filter(t=>t.status==='CLOSED')
  const open   = trades.filter(t=>t.status==='OPEN')
  const wins   = closed.filter(t=>t.result==='WIN')
  const losses = closed.filter(t=>t.result==='LOSS')
  const tp     = closed.reduce((s,t)=>s+(t.pnl||0),0)
  const wp     = wins.reduce((s,t)=>s+(t.pnl||0),0)
  const lp     = Math.abs(losses.reduce((s,t)=>s+(t.pnl||0),0))
  const wr     = closed.length?Math.round(wins.length/closed.length*100):0
  const pf     = lp>0?(wp/lp).toFixed(2):wins.length>0?'∞':'0'
  const aw     = wins.length?Math.round(wp/wins.length):0
  const al     = losses.length?Math.round(-lp/losses.length):0

  return (
    <>
      <div className="g4" style={{marginBottom:14}}>
        <div className="met"><div className="ml">Total P&L</div><div className={`mv ${tp>=0?'up':'dn'}`}>{tp>=0?'+':''}₹{Math.abs(Math.round(tp)).toLocaleString('en-IN')}</div></div>
        <div className="met"><div className="ml">Win Rate</div><div className={`mv ${wr>=55?'up':''}`}>{wr}%</div><div className="ms">{wins.length}W / {losses.length}L</div></div>
        <div className="met"><div className="ml">Profit Factor</div><div className={`mv ${parseFloat(pf)>=1.5?'up':''}`}>{pf}</div></div>
        <div className="met"><div className="ml">Avg Win / Loss</div><div className="mv">₹{aw} <span style={{color:'var(--text3)',fontSize:12}}>/</span> <span className="dn">₹{Math.abs(al)}</span></div></div>
      </div>

      <div className="card">
        <div className="ct"><span><i className="ti ti-flask"/> Open Trades ({open.length})</span></div>
        {open.length===0 ? <div style={{color:'var(--text3)',fontSize:12}}>No open trades.</div> :
          <div style={{overflowX:'auto'}}><table>
            <thead><tr><th>Symbol</th><th>Dir</th><th>Entry</th><th>SL</th><th>T1</th><th>Qty</th><th>R:R</th><th>Style</th><th>Source</th><th>Close</th></tr></thead>
            <tbody>{open.map(t=>(
              <tr key={t.id}>
                <td><b>{t.sym}</b></td>
                <td><span className={`bdg b-${t.dir==='LONG'?'buy':'sell'}`}>{t.dir}</span></td>
                <td>₹{t.entry}</td><td className="dn">₹{t.sl}</td><td className="up">₹{t.t1}</td>
                <td>{t.qty}</td><td>1:{t.rr}</td>
                <td><span className={`bdg b-${t.style==='fno'?'fno':'paper'}`} style={{fontSize:10}}>{t.style}</span></td>
                <td><span style={{fontSize:10,color:'var(--text3)'}}>{t.source||'manual'}</span></td>
                <td style={{whiteSpace:'nowrap'}}>
                  <input type="number" placeholder="Exit ₹" value={exitPrices[t.id]||''}
                    onChange={e=>setExitPrices(p=>({...p,[t.id]:e.target.value}))}
                    style={{width:70,padding:'4px 7px',fontSize:11,display:'inline-block',marginRight:5}}/>
                  <button className="btn btn-p btn-sm" onClick={()=>{
                    if(!exitPrices[t.id]){alert('Enter exit price');return}
                    onClose(t.id,parseFloat(exitPrices[t.id]))
                    setExitPrices(p=>({...p,[t.id]:''}))
                  }}>Close</button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        }
      </div>

      <div className="card">
        <div className="ct"><span><i className="ti ti-history"/> Closed Trades ({closed.length})</span></div>
        {closed.length===0 ? <div style={{color:'var(--text3)',fontSize:12}}>No closed trades yet.</div> :
          <div style={{overflowX:'auto'}}><table>
            <thead><tr><th>Symbol</th><th>Dir</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Style</th><th>Type</th><th>Result</th><th>Date</th></tr></thead>
            <tbody>{closed.slice(0,30).map(t=>(
              <tr key={t.id}>
                <td><b>{t.sym}</b></td>
                <td><span className={`bdg b-${t.dir==='LONG'?'buy':'sell'}`}>{t.dir}</span></td>
                <td>₹{t.entry}</td>
                <td>{t.exitP?'₹'+t.exitP:'—'}</td>
                <td className={(t.pnl||0)>=0?'up':'dn'}>{(t.pnl||0)>=0?'+':''}₹{Math.abs(t.pnl||0).toLocaleString('en-IN')}</td>
                <td><span className={`bdg b-${t.style==='fno'?'fno':'paper'}`} style={{fontSize:10}}>{t.style}</span></td>
                <td><span className="bdg" style={{fontSize:10,background:t.tradeType==='live'?'var(--ab)':'var(--bb)',color:t.tradeType==='live'?'var(--at)':'var(--bt)'}}>{t.tradeType==='live'?'LIVE':'PAPER'}</span></td>
                <td><span className={`bdg b-${t.result==='WIN'?'win':'loss'}`}>{t.result}</span></td>
                <td style={{fontSize:11,color:'var(--text3)'}}>{t.closedAt?new Date(t.closedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}):'—'}</td>
              </tr>
            ))}</tbody>
          </table></div>
        }
      </div>
    </>
  )
}

function ManualTradeTab({ onOpen }) {
  const [form, setForm] = useState({sym:'',style:'swing',dir:'LONG',qty:50,entry:'',sl:'',t1:'',t2:''})
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  return (
    <div className="card">
      <div className="ct"><i className="ti ti-pencil"/> Manual Paper Trade Entry</div>
      <div className="g2">
        <div className="fr"><label className="fl">Symbol</label>
          <input placeholder="e.g. RELIANCE" value={form.sym} onChange={e=>set('sym',e.target.value.toUpperCase())}/></div>
        <div className="fr"><label className="fl">Quantity</label>
          <input type="number" value={form.qty} onChange={e=>set('qty',+e.target.value)}/></div>
        <div className="fr"><label className="fl">Style</label>
          <select value={form.style} onChange={e=>set('style',e.target.value)}>
            <option value="swing">Swing</option><option value="intraday">Intraday</option><option value="fno">F&O</option>
          </select></div>
        <div className="fr"><label className="fl">Direction</label>
          <select value={form.dir} onChange={e=>set('dir',e.target.value)}>
            <option value="LONG">LONG (Buy)</option><option value="SHORT">SHORT (Sell)</option>
          </select></div>
        {[['Entry ₹','entry'],['Stop Loss ₹','sl'],['Target 1 ₹','t1'],['Target 2 ₹','t2']].map(([l,k])=>(
          <div key={k} className="fr"><label className="fl">{l}</label>
            <input type="number" value={form[k]} onChange={e=>set(k,e.target.value)}/></div>
        ))}
      </div>
      <RRCalc entry={form.entry} sl={form.sl} t1={form.t1} qty={form.qty}/>
      <button className="btn btn-p" onClick={()=>{
        if(!form.sym||!form.entry||!form.sl||!form.t1){alert('Fill all required fields');return}
        onOpen({sym:form.sym,entry:parseFloat(form.entry),sl:parseFloat(form.sl),t1:parseFloat(form.t1),t2:parseFloat(form.t2)||parseFloat(form.t1),qty:form.qty,dir:form.dir,style:form.style,tradeType:'paper',source:'manual'})
        setForm(f=>({...f,sym:'',entry:'',sl:'',t1:'',t2:''}))
        alert('✓ Paper trade simulated!')
      }}><i className="ti ti-plus"/> Simulate Paper Trade</button>
    </div>
  )
}

function AITradeTab({ creds, onOpen }) {
  const [sym, setSym]     = useState('RELIANCE')
  const [style, setStyle] = useState('swing')
  const [loading, setL]   = useState(false)
  const [result, setR]    = useState(null)
  const [err, setErr]     = useState('')
  const [added, setAdded] = useState(false)

  const analyse = async () => {
    setL(true); setErr(''); setR(null); setAdded(false)
    try {
      const r = await geminiJSON(creds.gkey,
        `Indian stock analyst. Generate a detailed ${style} paper trade setup for ${sym}.
Include: recent news sentiment, technical patterns, historical trend analysis.
Return ONLY JSON:
{"sym":"${sym}","cmp":0,"action":"BUY|SELL","entry":0,"sl":0,"t1":0,"t2":0,"qty":${style==='intraday'?100:style==='fno'?1:50},"conf":70,"rr":2.0,"rationale":"3 sentences covering news + technicals + historical","news":"latest relevant news","patterns":["pattern"],"hold":"X days"}`)
      if(r.raw) throw new Error('Could not parse response')
      setR(r)
    } catch(e) { setErr(e.message) }
    setL(false)
  }

  return (
    <div>
      <div className="card">
        <div className="ct"><i className="ti ti-wand"/> AI-Powered Paper Trade Analysis</div>
        <div style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
          <div style={{flex:1}}>
            <label className="fl">Stock</label>
            <select value={sym} onChange={e=>setSym(e.target.value)}>
              {STOCKS.map(s=><option key={s.s} value={s.s}>{s.s}</option>)}
            </select>
          </div>
          <div>
            <label className="fl">Style</label>
            <select value={style} onChange={e=>setStyle(e.target.value)}>
              <option value="swing">Swing</option><option value="intraday">Intraday</option><option value="fno">F&O</option>
            </select>
          </div>
          <button className="btn btn-p" onClick={analyse} disabled={loading}>
            <i className={`ti ti-wand${loading?' spin':''}`}/>
            {loading?'Analysing…':'Analyse & Generate Trade'}
          </button>
        </div>
      </div>

      {err && <div className="al al-e"><i className="ti ti-alert-circle"/>{err}</div>}

      {result && (
        <div className="card" style={{borderLeft:`3px solid ${result.action==='BUY'?'var(--green)':'var(--red)'}`,borderRadius:'0 14px 14px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <div>
              <span style={{fontSize:16,fontWeight:700}}>{result.sym}</span>
              <span className={`bdg b-${result.action==='BUY'?'buy':'sell'}`} style={{marginLeft:8}}>{result.action==='BUY'?'▲':'▼'} {result.action}</span>
              <div style={{fontSize:12,color:'var(--text2)',marginTop:5,lineHeight:1.6,maxWidth:480}}>{result.rationale}</div>
              {result.news && <div style={{fontSize:11,color:'var(--text3)',marginTop:4}}>📰 {result.news}</div>}
              {result.patterns?.length>0 && <div style={{marginTop:6}}>{result.patterns.map(p=><span key={p} className="bdg b-paper" style={{fontSize:10,marginRight:4}}>{p}</span>)}</div>}
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:24,fontWeight:700,color:result.conf>=65?'var(--green)':'var(--amber)'}}>{result.conf}%</div>
              <div style={{fontSize:10,color:'var(--text3)'}}>confidence</div>
              <div style={{fontSize:11,color:'var(--text3)'}}>R:R 1:{result.rr}</div>
            </div>
          </div>
          <div className="g3" style={{gap:8,marginBottom:12}}>
            {[['Entry','₹'+result.entry,'var(--blue)'],['Stop Loss','₹'+result.sl,'var(--red)'],
              ['Target 1','₹'+result.t1,'var(--green)'],['Target 2','₹'+(result.t2||result.t1),'var(--green)'],
              ['Hold',result.hold,'var(--text2)'],['Qty',result.qty,'var(--text)']].map(([l,v,c])=>(
              <div key={l} className="card-sm">
                <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase'}}>{l}</div>
                <div style={{fontSize:12,fontWeight:500,color:c}}>{v}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-p btn-sm" disabled={added} onClick={()=>{
            onOpen({sym:result.sym,entry:result.entry,sl:result.sl,t1:result.t1,t2:result.t2||result.t1,qty:result.qty,dir:result.action==='BUY'?'LONG':'SHORT',style,tradeType:'paper',source:'ai_paper'})
            setAdded(true)
          }}>
            <i className="ti ti-plus"/>{added?'✓ Added to paper trades':'Simulate This Paper Trade'}
          </button>
        </div>
      )}
    </div>
  )
}

function StyleBotTab({ style, onOpen, trades }) {
  const D = STYLE_INFO[style]
  const [sym,setSym]     = useState(D.defaults[0])
  const [dir,setDir]     = useState(D.defaults[1])
  const [qty,setQty]     = useState(D.defaults[2])
  const [entry,setEntry] = useState(D.defaults[3])
  const [sl,setSl]       = useState(D.defaults[4])
  const [t1,setT1]       = useState(D.defaults[5])
  const [t2,setT2]       = useState(D.defaults[6])
  const [done,setDone]   = useState(false)

  const stT  = trades.filter(t=>t.style===style)
  const stW  = stT.filter(t=>t.result==='WIN').length
  const stPnl= stT.filter(t=>t.pnl!=null).reduce((a,t)=>a+t.pnl,0)

  return (
    <>
      <div className="g3" style={{marginBottom:14}}>
        <div className="met"><div className="ml">{D.name} Trades</div><div className="mv">{stT.length}</div></div>
        <div className="met"><div className="ml">Wins</div><div className="mv up">{stW}</div></div>
        <div className="met"><div className="ml">Style P&L</div><div className={`mv ${stPnl>=0?'up':'dn'}`}>{stPnl>=0?'+':''}₹{Math.round(Math.abs(stPnl)).toLocaleString('en-IN')}</div></div>
      </div>

      <div className="card" style={{borderLeft:`3px solid ${D.color}`,borderRadius:'0 14px 14px 0'}}>
        <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
          <i className={`ti ${D.icon}`} style={{fontSize:22,color:D.color,flexShrink:0,marginTop:2}}/>
          <div>
            <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{D.name}</div>
            <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.6}}>{D.desc}</div>
          </div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="ct">Strategy Parameters</div>
          <table><tbody>{D.info.map(([l,v],i)=>(
            <tr key={l} style={{background:i%2===0?'var(--bg3)':'transparent'}}>
              <td style={{color:'var(--text3)',fontSize:11}}>{l}</td>
              <td style={{fontSize:12}}>{v}</td>
            </tr>
          ))}</tbody></table>
        </div>
        <div className="card">
          <div className="ct" style={{color:'var(--green)'}}>Advantages</div>
          <div style={{marginBottom:12}}>{D.pros.map(p=><div key={p} style={{display:'flex',gap:7,fontSize:12,color:'var(--text2)',padding:'3px 0'}}><span style={{color:'var(--green)',flexShrink:0}}>✓</span>{p}</div>)}</div>
          <div className="ct" style={{color:'var(--red)'}}>Disadvantages</div>
          {D.cons.map(c=><div key={c} style={{display:'flex',gap:7,fontSize:12,color:'var(--text2)',padding:'3px 0'}}><span style={{color:'var(--red)',flexShrink:0}}>✗</span>{c}</div>)}
        </div>
      </div>

      <div className="card" style={{border:`1px solid ${D.color}40`}}>
        <div className="ct" style={{color:D.color}}><i className="ti ti-flask"/> Paper Trading Bot — {D.name}</div>
        <div className="g2">
          <div className="fr"><label className="fl">Symbol</label><input value={sym} onChange={e=>setSym(e.target.value.toUpperCase())}/></div>
          <div className="fr"><label className="fl">Qty{style==='fno'?' (lots)':''}</label><input type="number" value={qty} onChange={e=>setQty(+e.target.value)}/></div>
          <div className="fr"><label className="fl">Direction</label>
            <select value={dir} onChange={e=>setDir(e.target.value)}>
              <option value="LONG">LONG (Buy)</option><option value="SHORT">SHORT (Sell)</option>
            </select></div>
          {[['Entry ₹',entry,setEntry],['Stop Loss ₹',sl,setSl],['Target 1 ₹',t1,setT1],['Target 2 ₹',t2,setT2]].map(([l,v,s])=>(
            <div key={l} className="fr"><label className="fl">{l}</label><input type="number" value={v} onChange={e=>s(+e.target.value)}/></div>
          ))}
        </div>
        <RRCalc entry={entry} sl={sl} t1={t1} qty={qty}/>
        <button className="btn btn-p" disabled={done} onClick={()=>{
          if(!sym||!entry||!sl||!t1){alert('Fill all fields');return}
          onOpen({sym,entry,sl,t1,t2,qty,dir,style,tradeType:'paper',source:'bot'})
          setDone(true)
          setTimeout(()=>setDone(false),2500)
        }}>
          <i className="ti ti-plus"/>
          {done?'✓ Trade Simulated!':'Simulate '+D.name+' Paper Trade'}
        </button>
      </div>
    </>
  )
}

export default function PaperTrades({ creds, trades, onOpen, onClose }) {
  const [tab, setTab] = useState('overview')
  const tabs = [
    ['overview','Overview'],['manual','Manual Entry'],['ai','AI Analysis'],
    ['swing','Swing Bot'],['intraday','Intraday Bot'],['fno','F&O Bot']
  ]
  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">Paper Trades</div><div className="ps">Simulate trades manually or via AI — no real capital</div></div>
        <span className="bdg b-paper">Phase 1 · Paper Only</span>
      </div>
      <div className="tabs">
        {tabs.map(([id,label])=>(
          <div key={id} className={`tab${tab===id?' on':''}`} onClick={()=>setTab(id)}>{label}</div>
        ))}
      </div>
      {tab==='overview'  && <OverviewTab trades={trades} onClose={onClose}/>}
      {tab==='manual'    && <ManualTradeTab onOpen={onOpen}/>}
      {tab==='ai'        && <AITradeTab creds={creds} onOpen={onOpen}/>}
      {(tab==='swing'||tab==='intraday'||tab==='fno') && <StyleBotTab style={tab} onOpen={onOpen} trades={trades}/>}
    </div>
  )
}
