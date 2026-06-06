import React, { useState } from 'react'
import { dhan } from '../utils/dhan.js'
import { groqJSON } from '../utils/groq.js'

export default function Portfolio({ creds, holdings, positions, funds, setHoldings, setPositions, setFunds }) {
  const [loading, setL]     = useState(false)
  const [reviewing, setRev] = useState(false)
  const [review, setReview] = useState(null)
  const [err, setErr]       = useState('')

  const load = async () => {
    setL(true); setErr('')
    try {
      const [h,p,f] = await Promise.allSettled([
        dhan.holdings(creds.cid, creds.tok),
        dhan.positions(creds.cid, creds.tok),
        dhan.funds(creds.cid, creds.tok),
      ])
      if(h.status==='fulfilled') setHoldings(Array.isArray(h.value)?h.value:[])
      if(p.status==='fulfilled') setPositions(Array.isArray(p.value)?p.value:[])
      if(f.status==='fulfilled') setFunds(f.value)
    } catch(e) { setErr(e.message) }
    setL(false)
  }

  const aiReview = async () => {
    setRev(true); setErr('')
    try {
      const r = await groqJSON(creds.akey,
        `Portfolio manager. Review this Indian stock portfolio.
Holdings: ${JSON.stringify(holdings.map(h=>({sym:h.tradingSymbol,qty:h.totalQty,avg:h.avgCostPrice})))}
Return ONLY JSON:
{"summary":"2 sentences","div_score":7,"risk":"High|Medium|Low","recs":[{"sym":"SYMBOL","action":"HOLD|ADD|REDUCE|EXIT","reason":"one sentence","urgency":"High|Medium|Low"}],"sector_note":"one sentence","top_risk":"one sentence","add_ideas":["idea1","idea2"]}`)
      setReview(r)
    } catch(e) { setErr(e.message) }
    setRev(false)
  }

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">Portfolio</div><div className="ps">Live holdings and positions from your Dhan account</div></div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn" onClick={load} disabled={loading}>
            <i className={`ti ti-refresh${loading?' spin':''}`}/>{loading?'Loading…':'Load from Dhan'}
          </button>
          <button className="btn" onClick={aiReview} disabled={reviewing||holdings.length===0}>
            <i className={`ti ti-wand${reviewing?' spin':''}`}/>{reviewing?'Reviewing…':'AI Review'}
          </button>
        </div>
      </div>

      <div className="al al-i"><i className="ti ti-info-circle"/>Holdings are fetched live from Dhan. Click "Load from Dhan" to refresh.</div>
      {err && <div className="al al-e"><i className="ti ti-alert-circle"/>{err}</div>}

      {funds && (
        <div className="g4" style={{marginBottom:14}}>
          {[['Available',Math.round(funds.availabelBalance||0)],['SOD Limit',Math.round(funds.sodLimit||0)],['Utilised',Math.round(funds.utilizedAmount||0)],['Withdrawable',Math.round(funds.withdrawableBalance||0)]].map(([l,v])=>(
            <div key={l} className="met"><div className="ml">{l}</div><div className="mv">₹{v.toLocaleString('en-IN')}</div></div>
          ))}
        </div>
      )}

      {holdings.length>0 && (
        <div className="card">
          <div className="ct"><span><i className="ti ti-briefcase"/> Holdings ({holdings.length})</span></div>
          <div style={{overflowX:'auto'}}><table>
            <thead><tr><th>Symbol</th><th>Total Qty</th><th>Avail Qty</th><th>T+1 Qty</th><th>Avg Cost</th><th>Exchange</th></tr></thead>
            <tbody>{holdings.map((h,i)=>(
              <tr key={i}><td><b>{h.tradingSymbol}</b></td><td>{h.totalQty}</td><td>{h.availableQty}</td><td>{h.t1Qty||0}</td><td>₹{Number(h.avgCostPrice||0).toFixed(2)}</td><td style={{color:'var(--text3)'}}>{h.exchange}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      )}

      {positions.length>0 && (
        <div className="card">
          <div className="ct"><span><i className="ti ti-chart-line"/> Open Positions ({positions.length})</span></div>
          <div style={{overflowX:'auto'}}><table>
            <thead><tr><th>Symbol</th><th>Type</th><th>Net Qty</th><th>Buy Avg</th><th>Unrealised P&L</th><th>Product</th></tr></thead>
            <tbody>{positions.map((p,i)=>(
              <tr key={i}>
                <td><b>{p.tradingSymbol}</b></td>
                <td><span className={`bdg b-${p.positionType==='LONG'?'buy':'sell'}`}>{p.positionType}</span></td>
                <td>{p.netQty}</td>
                <td>₹{Number(p.buyAvg||0).toFixed(2)}</td>
                <td className={(p.unrealizedProfit||0)>=0?'up':'dn'}>{(p.unrealizedProfit||0)>=0?'+':''}₹{Number(p.unrealizedProfit||0).toFixed(2)}</td>
                <td style={{color:'var(--text3)'}}>{p.productType}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
      )}

      {!holdings.length && !loading && (
        <div className="card" style={{textAlign:'center',padding:40,color:'var(--text3)',fontSize:12}}>
          Click "Load from Dhan" to fetch your live holdings and positions.
        </div>
      )}

      {review && (
        <div className="card" style={{border:'1px solid var(--gbr)'}}>
          <div className="ct" style={{color:'var(--green)'}}><i className="ti ti-wand"/> AI Portfolio Review</div>
          <p style={{fontSize:12,color:'var(--text2)',marginBottom:12}}>{review.summary}</p>
          <div className="g3" style={{marginBottom:12}}>
            <div className="met"><div className="ml">Diversification</div><div className={`mv ${(review.div_score||0)>=6?'up':''}`}>{review.div_score||'—'}/10</div></div>
            <div className="met"><div className="ml">Risk Level</div><div className={`mv ${review.risk==='High'?'dn':review.risk==='Low'?'up':''}`}>{review.risk||'—'}</div></div>
            <div className="met"><div className="ml">Top Risk</div><div style={{fontSize:11,color:'var(--text2)',marginTop:4,lineHeight:1.5}}>{review.top_risk||'—'}</div></div>
          </div>
          {review.recs?.map(rc=>(
            <div key={rc.sym} className="row" style={{fontSize:12}}>
              <span style={{fontWeight:500,minWidth:80}}>{rc.sym}</span>
              <span className={`bdg b-${rc.action==='EXIT'||rc.action==='REDUCE'?'sell':rc.action==='ADD'?'buy':'hold'}`}>{rc.action}</span>
              <span style={{flex:1,color:'var(--text3)',margin:'0 12px'}}>{rc.reason}</span>
              <span style={{fontSize:10,color:rc.urgency==='High'?'var(--red)':'var(--text3)'}}>{rc.urgency}</span>
            </div>
          ))}
          {review.add_ideas?.length>0 && <div style={{marginTop:10,fontSize:11,color:'var(--bt)'}}>Consider adding: {review.add_ideas.join(', ')}</div>}
        </div>
      )}
    </div>
  )
}
