import React, { useState } from 'react'
import { geminiJSON } from '../utils/gemini.js'
import { STOCKS } from '../utils/dhan.js'

export default function AISignals({ creds, onAddTrade }) {
  const [style, setStyle]   = useState('swing')
  const [n, setN]           = useState('5')
  const [minC, setMinC]     = useState('65')
  const [loading, setL]     = useState(false)
  const [signals, setSignals] = useState([])
  const [err, setErr]       = useState('')
  const [added, setAdded]   = useState({})

  const scan = async () => {
    setL(true); setErr(''); setSignals([]); setAdded({})
    const syms = STOCKS.slice(0,parseInt(n)).map(s=>s.s)
    try {
      const r = await geminiJSON(creds.gkey,
        `You are an expert Indian stock market analyst. Generate realistic ${style} trading signals for these stocks: ${syms.join(', ')}.
Trading style: ${style} — ${style==='swing'?'hold 2-15 days based on EOD charts':style==='intraday'?'same-day exit, use intraday momentum':style==='fno'?'futures/options derivative position based on index movement':'swing trade'}

Analyse each stock realistically. Mix BUY, SELL, and AVOID recommendations based on current market conditions.
Only include stocks with confidence >= ${minC}%.

Return ONLY a valid JSON array (no markdown, no explanation):
[{"sym":"RELIANCE","cmp":2840,"action":"BUY|SELL|AVOID","conviction":"High|Medium|Low","entry":2840,"sl":2700,"t1":2980,"t2":3050,"conf":72,"rr":2.1,"rationale":"2 sentence reason based on technicals","style":"${style}","patterns":["Bull Flag"],"news_sentiment":"Positive|Neutral|Negative"}]

Generate for ALL ${n} stocks: ${syms.join(', ')}`, 2500)

      const arr = Array.isArray(r) ? r.filter(s=>s.action!=='AVOID'&&s.conf>=parseInt(minC)) : []
      setSignals(arr)
      if (!arr.length) setErr('No signals found above '+minC+'% confidence. Try lowering the threshold or scanning more stocks.')
    } catch (e) { setErr(e.message) }
    setL(false)
  }

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">AI Signals</div><div className="ps">Scan multiple stocks and generate AI trade setups</div></div>
      </div>
      <div className="al al-w">
        <i className="ti ti-alert-triangle"/>
        <span>AI-generated analysis only. Final trade decisions are entirely yours. Paper trading phase — no real capital.</span>
      </div>

      <div className="card" style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
        {[['Style',style,setStyle,[['swing','Swing (2–15 days)'],['intraday','Intraday (same day)'],['fno','F&O (derivatives)']]],
          ['Stocks',n,setN,[['5','Top 5 stocks'],['8','Top 8 stocks'],['12','All 12 stocks']]],
          ['Min confidence',minC,setMinC,[['60','60%+'],['65','65%+'],['70','70%+']]]
        ].map(([label,val,setter,opts])=>(
          <div key={label}>
            <label className="fl">{label}</label>
            <select value={val} onChange={e=>setter(e.target.value)}>
              {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
        <button className="btn btn-p" onClick={scan} disabled={loading}>
          <i className={`ti ti-radar${loading?' spin':''}`}/>
          {loading?'Scanning…':'Scan markets'}
        </button>
      </div>

      {err && <div className="al al-w"><i className="ti ti-info-circle"/>{err}</div>}

      {signals.length>0 && (
        <div className="g2">
          {signals.map(s=>{
            const ib=s.action==='BUY'
            const qty=style==='intraday'?100:style==='fno'?1:50
            const risk=Math.round(Math.abs(s.entry-s.sl)*qty)
            const rew=Math.round(Math.abs(s.t1-s.entry)*qty)
            return (
              <div key={s.sym} className="card" style={{borderLeft:`3px solid ${ib?'var(--green)':'var(--red)'}`,borderRadius:'0 14px 14px 0'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div>
                    <span style={{fontSize:15,fontWeight:600}}>{s.sym}</span>
                    <span className={`bdg b-${ib?'buy':'sell'}`} style={{marginLeft:6}}>{ib?'▲':'▼'} {s.action}</span>
                    {s.news_sentiment && <span className={`bdg`} style={{fontSize:9,marginLeft:4,background:s.news_sentiment==='Positive'?'var(--gb)':s.news_sentiment==='Negative'?'var(--rb)':'var(--ab)',color:s.news_sentiment==='Positive'?'var(--gt)':s.news_sentiment==='Negative'?'var(--rt)':'var(--at)'}}>📰 {s.news_sentiment}</span>}
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:4,lineHeight:1.5}}>{s.rationale}</div>
                    {s.patterns?.length>0 && <div style={{marginTop:4}}>{s.patterns.map(p=><span key={p} className="bdg b-paper" style={{fontSize:9,marginRight:3}}>{p}</span>)}</div>}
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:18,fontWeight:700,color:s.conf>=70?'var(--green)':'var(--amber)'}}>{s.conf}%</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>R:R 1:{s.rr}</div>
                  </div>
                </div>
                <div className="g3" style={{gap:6,marginBottom:10}}>
                  {[['CMP','₹'+s.cmp,'var(--text)'],['Entry','₹'+s.entry,'var(--blue)'],['SL','₹'+s.sl,'var(--red)'],
                    ['T1','₹'+s.t1,'var(--green)'],['Risk','₹'+risk.toLocaleString('en-IN'),'var(--red)'],['Reward','₹'+rew.toLocaleString('en-IN'),'var(--green)']].map(([l,v,c])=>(
                    <div key={l} className="card-sm" style={{padding:8}}>
                      <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase'}}>{l}</div>
                      <div style={{fontSize:11,fontWeight:500,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-p btn-sm" disabled={added[s.sym]}
                  onClick={()=>{
                    onAddTrade({sym:s.sym,entry:s.entry,sl:s.sl,t1:s.t1,t2:s.t2||s.t1,qty,dir:ib?'LONG':'SHORT',style,tradeType:'paper',source:'ai_signal'})
                    setAdded(a=>({...a,[s.sym]:true}))
                  }}>
                  <i className="ti ti-plus"/>
                  {added[s.sym]?'✓ Added to paper trades':'Add paper trade'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
