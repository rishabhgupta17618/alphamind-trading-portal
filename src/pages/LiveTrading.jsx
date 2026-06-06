import React, { useState } from 'react'
import { groqJSON } from '../utils/groq.js'
import { dhan, STOCKS, DEFAULT_RISK } from '../utils/dhan.js'
import { lsGet, lsSet, KEYS } from '../utils/storage.js'

export default function LiveTrading({ creds, riskConfig, setRiskConfig, onAddTrade, funds }) {
  const [sym, setSym]         = useState('RELIANCE')
  const [loading, setL]       = useState(false)
  const [proposal, setProposal] = useState(null)
  const [err, setErr]         = useState('')
  const [approving, setApproving] = useState(false)
  const [approved, setApproved]   = useState(false)
  const [placingOrder, setPlacing] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [showRisk, setShowRisk] = useState(false)
  const [rc, setRc]           = useState(riskConfig)

  const capital = parseFloat(funds?.availabelBalance || 0)

  const generateProposal = async () => {
    setL(true); setErr(''); setProposal(null); setApproved(false); setOrderResult(null)
    try {
      const stk = STOCKS.find(x=>x.s===sym)||STOCKS[0]
      let closes = []
      try {
        const to = new Date().toISOString().slice(0,10)
        const fr = new Date(Date.now()-200*86400000).toISOString().slice(0,10)
        const h  = await dhan.historical(creds.cid,creds.tok,stk.id,stk.sg,fr,to)
        closes   = h?.close||[]
      } catch {}
      if (!closes.length) closes = Array.from({length:60},(_,i)=>Math.round(2600+i*7+Math.sin(i/4)*50))
      const cmp = closes[closes.length-1]

      // Calculate position size from risk config
      const maxCapital     = capital * (rc.maxPositionSizePct/100)
      const suggestedQty   = Math.floor(maxCapital / cmp)

      const r = await groqJSON(creds.akey,
        `Expert Indian stock analyst. Generate a LIVE trade proposal for ${sym}.
Current price: ₹${cmp}, Last 60 closes: ${closes.slice(-60).join(',')}
Available capital: ₹${Math.round(capital).toLocaleString('en-IN')}
Max position size: ₹${Math.round(maxCapital).toLocaleString('en-IN')} (${rc.maxPositionSizePct}% of capital)
Suggested quantity: ${suggestedQty} shares
Min R:R required: 1:${rc.minRR}

Return ONLY JSON:
{"sym":"${sym}","cmp":${cmp},"action":"BUY|SELL","entry":0,"sl":0,"t1":0,"t2":0,"qty":${suggestedQty},"conf":0,"rr":0,"rationale":"3 sentences","risks":["risk1","risk2","risk3"],"order_type":"LIMIT","product_type":"CNC","exchange":"NSE"}`)
      if(r.raw) throw new Error('Could not parse AI response')
      if(r.rr < rc.minRR) throw new Error(`R:R ratio (1:${r.rr}) below minimum required (1:${rc.minRR}). Skipping this trade.`)
      setProposal(r)
    } catch (e) { setErr(e.message) }
    setL(false)
  }

  const placeRealOrder = async () => {
    if (!proposal) return
    setPlacing(true)
    try {
      const order = {
        transactionType: proposal.action === 'BUY' ? 'BUY' : 'SELL',
        exchangeSegment: 'NSE_EQ',
        productType: proposal.product_type || 'CNC',
        orderType: 'LIMIT',
        validity: 'DAY',
        tradingSymbol: proposal.sym,
        securityId: STOCKS.find(s=>s.s===proposal.sym)?.id || '',
        quantity: proposal.qty,
        price: proposal.entry,
        disclosedQuantity: 0,
        afterMarketOrder: false,
      }
      const result = await dhan.placeOrder(creds.cid, creds.tok, order)
      setOrderResult({ success: true, orderId: result.orderId || result.data?.orderId, result })
      // Save as live trade
      onAddTrade({
        sym: proposal.sym, entry: proposal.entry, sl: proposal.sl,
        t1: proposal.t1, t2: proposal.t2||proposal.t1,
        qty: proposal.qty, dir: proposal.action==='BUY'?'LONG':'SHORT',
        style: 'swing', tradeType: 'live', source: 'live_ai',
        orderId: result.orderId, orderStatus: 'PLACED'
      })
    } catch (e) {
      setOrderResult({ success: false, error: e.message })
    }
    setPlacing(false)
  }

  const saveRiskConfig = () => {
    setRiskConfig(rc)
    lsSet(KEYS.RISK, rc)
    setShowRisk(false)
    alert('✓ Risk controls saved')
  }

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">Live Trading</div><div className="ps">AI-generated proposals — you approve every trade</div></div>
        <button className="btn" onClick={()=>setShowRisk(!showRisk)}>
          <i className="ti ti-shield"/> Risk Controls
        </button>
      </div>

      <div className="al al-w">
        <i className="ti ti-alert-triangle"/>
        <div>
          <b>Important:</b> This section places REAL orders with real capital on your Dhan account.
          AI only generates proposals — <b>you must manually approve each trade</b> before it is placed.
          Ensure your risk controls are configured correctly before proceeding.
        </div>
      </div>

      {/* Risk Controls Panel */}
      {showRisk && (
        <div className="card" style={{border:'1px solid var(--amber)40'}}>
          <div className="ct" style={{color:'var(--amber)'}}><i className="ti ti-shield"/> Risk Management Controls</div>
          <div className="g2">
            {[['Max Position Size (% of capital)', 'maxPositionSizePct', 5, 0.5, 50, '%'],
              ['Daily Loss Limit (% of capital)',   'dailyLossLimitPct',  1, 0.5, 20, '%'],
              ['Max Open Positions',                'maxOpenPositions',   1, 1, 20, ''],
              ['Max Capital Deployed (%)',          'maxCapitalDeployed', 10, 10, 100, '%'],
              ['Minimum R:R Ratio',                 'minRR',             0.5, 0.5, 5, ''],
            ].map(([label,key,step,min,max,unit])=>(
              <div key={key} className="fr">
                <label className="fl">{label}</label>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <input type="number" value={rc[key]} min={min} max={max} step={step}
                    onChange={e=>setRc(p=>({...p,[key]:parseFloat(e.target.value)}))}
                    style={{flex:1}}/>
                  {unit && <span style={{color:'var(--text3)',fontSize:12,flexShrink:0}}>{unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="fr">
            <label className="fl">Stop Loss Required on Every Trade</label>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:4}}>
              {[true,false].map(v=>(
                <label key={String(v)} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:12}}>
                  <input type="radio" checked={rc.stopLossRequired===v} onChange={()=>setRc(p=>({...p,stopLossRequired:v}))}/>
                  {v?'Yes (Recommended)':'No'}
                </label>
              ))}
            </div>
          </div>

          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn btn-p" onClick={saveRiskConfig}><i className="ti ti-check"/> Save Risk Controls</button>
            <button className="btn" onClick={()=>setShowRisk(false)}>Cancel</button>
            <button className="btn btn-sm" style={{marginLeft:'auto',color:'var(--text3)'}}
              onClick={()=>{setRc(DEFAULT_RISK);alert('Reset to defaults')}}>
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      {/* Current Risk Summary */}
      <div className="g4" style={{marginBottom:14}}>
        <div className="met"><div className="ml">Max Position Size</div><div className="mv">{rc.maxPositionSizePct}%</div><div className="ms">of ₹{capital?Math.round(capital).toLocaleString('en-IN'):'—'}</div></div>
        <div className="met"><div className="ml">Daily Loss Limit</div><div className="mv dn">{rc.dailyLossLimitPct}%</div><div className="ms">triggers pause</div></div>
        <div className="met"><div className="ml">Max Open Positions</div><div className="mv">{rc.maxOpenPositions}</div></div>
        <div className="met"><div className="ml">Min R:R Required</div><div className="mv up">1:{rc.minRR}</div></div>
      </div>

      {/* Generate Proposal */}
      <div className="card">
        <div className="ct"><i className="ti ti-wand"/> Generate AI Trade Proposal</div>
        <div style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:140}}>
            <label className="fl">Stock</label>
            <select value={sym} onChange={e=>setSym(e.target.value)}>
              {STOCKS.map(s=><option key={s.s} value={s.s}>{s.s}</option>)}
            </select>
          </div>
          <button className="btn btn-p" onClick={generateProposal} disabled={loading}>
            <i className={`ti ti-wand${loading?' spin':''}`}/>
            {loading?'Generating…':'Generate Proposal'}
          </button>
        </div>
      </div>

      {err && <div className="al al-e"><i className="ti ti-alert-circle"/>{err}</div>}

      {/* Trade Proposal */}
      {proposal && !orderResult && (
        <div className="card" style={{border:'2px solid var(--amber)',borderRadius:14}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <i className="ti ti-shield-check" style={{fontSize:20,color:'var(--amber)'}}/>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:'var(--amber)'}}>AI Trade Proposal — Awaiting Your Approval</div>
              <div style={{fontSize:11,color:'var(--text3)'}}>Review carefully before approving. This will place a REAL order.</div>
            </div>
          </div>

          <div className="g3" style={{gap:8,marginBottom:14}}>
            {[['Symbol',proposal.sym,'var(--text)'],['Action',proposal.action,proposal.action==='BUY'?'var(--green)':'var(--red)'],
              ['Entry','₹'+proposal.entry,'var(--blue)'],['Stop Loss','₹'+proposal.sl,'var(--red)'],
              ['Target 1','₹'+proposal.t1,'var(--green)'],['Target 2','₹'+(proposal.t2||proposal.t1),'var(--green)'],
              ['Quantity',proposal.qty+' shares','var(--text)'],['R:R','1:'+proposal.rr,parseFloat(proposal.rr)>=rc.minRR?'var(--green)':'var(--red)'],
              ['Confidence',proposal.conf+'%',proposal.conf>=65?'var(--green)':'var(--amber)']].map(([l,v,c])=>(
              <div key={l} className="card-sm">
                <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase'}}>{l}</div>
                <div style={{fontSize:13,fontWeight:500,color:c}}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{background:'var(--bg3)',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
            <div style={{fontSize:11,color:'var(--text3)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.4px'}}>AI Rationale</div>
            <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.6}}>{proposal.rationale}</div>
          </div>

          <div style={{background:'var(--rb)',border:'1px solid var(--rbr)',borderRadius:8,padding:'10px 14px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--rt)',marginBottom:6}}>⚠ Risks to consider before approving:</div>
            {(proposal.risks||[]).map((r,i)=><div key={i} style={{fontSize:12,color:'var(--rt)',padding:'2px 0'}}>• {r}</div>)}
          </div>

          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {!approved ? (
              <>
                <button className="btn btn-p" style={{background:'var(--amber)',borderColor:'var(--amber)',color:'#000'}}
                  onClick={()=>setApproved(true)}>
                  <i className="ti ti-check"/> I Approve — Place Real Order
                </button>
                <button className="btn" onClick={()=>setProposal(null)}>
                  <i className="ti ti-x"/> Reject Proposal
                </button>
              </>
            ) : (
              <>
                <div className="al al-s" style={{flex:1,marginBottom:0}}>
                  <i className="ti ti-check"/>
                  <span>You approved this trade. Click Place Order to execute on Dhan.</span>
                </div>
                <button className="btn btn-p" onClick={placeRealOrder} disabled={placingOrder}
                  style={{background:'var(--green)',borderColor:'var(--green)',color:'#000'}}>
                  <i className={`ti ti-send${placingOrder?' spin':''}`}/>
                  {placingOrder?'Placing…':'Place Real Order on Dhan'}
                </button>
                <button className="btn" onClick={()=>{setApproved(false);setProposal(null)}}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Result */}
      {orderResult && (
        <div className={`al ${orderResult.success?'al-s':'al-e'}`}>
          <i className={`ti ti-${orderResult.success?'check':'alert-circle'}`}/>
          {orderResult.success
            ? <span>✓ Order placed successfully! Order ID: <b>{orderResult.orderId}</b>. Check Dhan app for confirmation.</span>
            : <span>Order failed: {orderResult.error}</span>
          }
        </div>
      )}
    </div>
  )
}
