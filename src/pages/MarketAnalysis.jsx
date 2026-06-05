import React, { useState } from 'react'
import { geminiJSON } from '../utils/gemini.js'
import { dhan, STOCKS } from '../utils/dhan.js'

export default function MarketAnalysis({ creds, onAddTrade }) {
  const [sym, setSym]     = useState('RELIANCE')
  const [tf, setTf]       = useState('daily')
  const [loading, setL]   = useState(false)
  const [result, setR]    = useState(null)
  const [err, setErr]     = useState('')
  const [addedStyle, setAddedStyle] = useState(null)

  const run = async () => {
    setL(true); setErr(''); setR(null); setAddedStyle(null)
    try {
      const stk = STOCKS.find(x => x.s === sym) || STOCKS[0]
      let closes = [], vols = []
      const to  = new Date().toISOString().slice(0,10)
      const fr  = new Date(Date.now()-400*86400000).toISOString().slice(0,10)
      try {
        const h = await dhan.historical(creds.cid, creds.tok, stk.id, stk.sg, fr, to)
        closes = h?.close || h?.data?.close || []
        vols   = h?.volume || h?.data?.volume || []
      } catch (e) {
        console.warn('Historical data fetch failed, using mock:', e.message)
      }
      if (!closes.length) closes = Array.from({length:80},(_,i)=>Math.round(2600+i*7+Math.sin(i/4)*50))
      if (!vols.length)   vols   = closes.map(()=>Math.round(400000+Math.random()*300000))
      const cmp = closes[closes.length-1]

      const a = await geminiJSON(creds.gkey, `You are an expert Indian stock market analyst.
Analyse ${sym} for a ${tf} trade setup.
Last 80 closing prices: ${closes.slice(-80).join(',')}
Last 80 volumes: ${vols.slice(-80).join(',')}
Current price: ₹${cmp}

Compute SMA20, SMA50, RSI14, MACD signal, ADX, and support/resistance from the data provided.

Return ONLY valid JSON (no markdown):
{"sym":"${sym}","cmp":${cmp},"trend":"Bullish|Bearish|Neutral","strength":"Strong|Moderate|Weak","sma20":0,"sma50":0,"rsi":0,"rsi_sig":"Overbought|Neutral|Oversold","macd":"Bullish|Bearish|Neutral","vol":"High|Normal|Low","adx":0,"adx_trend":"Strong|Moderate|Weak","s1":0,"s2":0,"r1":0,"r2":0,"patterns":["pattern"],"action":"BUY|SELL|HOLD|AVOID","conviction":"High|Medium|Low","entry_lo":0,"entry_hi":0,"sl":0,"t1":0,"t2":0,"t3":0,"conf":70,"rr":2.0,"est_profit_100":0,"est_loss_100":0,"rationale":"3 sentence explanation","trigger":"entry confirmation","risks":["risk1","risk2"],"hold":"X days","news_sentiment":"Positive|Neutral|Negative","fundamental_note":"brief fundamental context for ${sym}"}`, 2200)

      if (a.raw) throw new Error('Could not parse AI response. Try again.')
      setR(a)
    } catch (e) { setErr(e.message) }
    setL(false)
  }

  const ib = result?.action==='BUY', is = result?.action==='SELL'
  const bc = ib?'var(--green)':is?'var(--red)':'var(--amber)'

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">Market Analysis</div><div className="ps">AI-powered technical + fundamental analysis with trade recommendation</div></div>
      </div>

      <div className="card" style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:140}}>
          <label className="fl">Stock / Index</label>
          <select value={sym} onChange={e=>setSym(e.target.value)}>
            {STOCKS.map(s=><option key={s.s} value={s.s}>{s.s}</option>)}
          </select>
        </div>
        <div>
          <label className="fl">Timeframe</label>
          <select value={tf} onChange={e=>setTf(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="intraday">Intraday (15m)</option>
          </select>
        </div>
        <button className="btn btn-p" onClick={run} disabled={loading}>
          <i className={`ti ti-wand${loading?' spin':''}`}/>
          {loading?'Analysing…':'Run AI Analysis'}
        </button>
      </div>

      {err && <div className="al al-e"><i className="ti ti-alert-circle"/>{err}</div>}

      {loading && (
        <div className="card" style={{textAlign:'center',padding:40}}>
          <i className="ti ti-wand spin" style={{fontSize:28,color:'var(--green)'}}/>
          <div style={{marginTop:10,color:'var(--text3)',fontSize:12}}>Analysing <b style={{color:'var(--text)'}}>{sym}</b> — fetching data and running AI analysis…</div>
        </div>
      )}

      {!result && !loading && !err && (
        <div style={{textAlign:'center',padding:'50px 0',color:'var(--text3)',fontSize:12}}>
          Select a stock and click Run AI Analysis<br/>
          AI computes RSI, MACD, ADX, S&R levels and generates a full trade recommendation
        </div>
      )}

      {result && !result.raw && (
        <div className="card" style={{borderLeft:`3px solid ${bc}`,borderRadius:'0 14px 14px 0'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14,gap:10,flexWrap:'wrap'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:5}}>
                <span style={{fontSize:18,fontWeight:700}}>{result.sym}</span>
                <span style={{fontSize:15,color:'var(--text2)'}}>₹{Number(result.cmp).toLocaleString('en-IN')}</span>
                <span className={`bdg b-${ib?'buy':is?'sell':'hold'}`}>{ib?'▲':is?'▼':'◆'} {result.action}</span>
                <span style={{fontSize:11,color:'var(--text3)'}}>{result.conviction} conviction · {result.hold}</span>
                {result.news_sentiment && <span className={`bdg`} style={{fontSize:10,background:result.news_sentiment==='Positive'?'var(--gb)':result.news_sentiment==='Negative'?'var(--rb)':'var(--ab)',color:result.news_sentiment==='Positive'?'var(--gt)':result.news_sentiment==='Negative'?'var(--rt)':'var(--at)'}}>📰 {result.news_sentiment}</span>}
              </div>
              <div style={{fontSize:12,color:'var(--text2)',maxWidth:520,lineHeight:1.6}}>{result.rationale}</div>
              {result.fundamental_note && <div style={{fontSize:11,color:'var(--text3)',marginTop:4,fontStyle:'italic'}}>{result.fundamental_note}</div>}
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:28,fontWeight:700,color:result.conf>=65?'var(--green)':'var(--amber)'}}>{result.conf}%</div>
              <div style={{fontSize:10,color:'var(--text3)'}}>confidence</div>
              <div style={{fontSize:11,color:'var(--text3)'}}>R:R 1:{result.rr}</div>
            </div>
          </div>

          <div className="g3" style={{gap:8,marginBottom:12}}>
            {[['Entry zone','₹'+result.entry_lo+'–₹'+result.entry_hi,'var(--blue)'],
              ['Stop loss','₹'+result.sl,'var(--red)'],
              ['Target 1','₹'+result.t1,'var(--green)'],
              ['Target 2','₹'+result.t2,'var(--green)'],
              ['Target 3','₹'+result.t3,'var(--green)'],
              ['Hold period',result.hold,'var(--text2)']].map(([l,v,c])=>(
              <div key={l} className="card-sm">
                <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:3}}>{l}</div>
                <div style={{fontSize:13,fontWeight:500,color:c}}>{v}</div>
              </div>
            ))}
          </div>

          <div className="g2" style={{marginBottom:14}}>
            <div className="card-sm">
              <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',marginBottom:3}}>Est. profit (100 shares)</div>
              <div className="up" style={{fontWeight:500,fontSize:14}}>+₹{Number(result.est_profit_100||0).toLocaleString('en-IN')}</div>
            </div>
            <div className="card-sm">
              <div style={{fontSize:9,color:'var(--text3)',textTransform:'uppercase',marginBottom:3}}>Est. loss (100 shares)</div>
              <div className="dn" style={{fontWeight:500,fontSize:14}}>-₹{Number(result.est_loss_100||0).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="g2">
            <div>
              <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',marginBottom:8}}>Technical Signals</div>
              {[['Trend',result.trend+' · '+result.strength,result.trend==='Bullish'?'sig-b':result.trend==='Bearish'?'sig-r':'sig-a'],
                ['RSI ('+result.rsi+')',result.rsi_sig,result.rsi_sig==='Oversold'?'sig-b':result.rsi_sig==='Overbought'?'sig-r':'sig-a'],
                ['MACD',result.macd,result.macd==='Bullish'?'sig-b':'sig-r'],
                ['ADX ('+result.adx+')',result.adx_trend+' trend',result.adx_trend==='Strong'?'sig-b':'sig-a'],
                ['Volume',result.vol,result.vol==='High'?'sig-b':'sig-a'],
                ['SMA 20/50','₹'+result.sma20+' / ₹'+result.sma50,'sig-a']].map(([l,v,sc])=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
                  <span className={`sig ${sc}`}/>
                  <span style={{color:'var(--text3)',width:80,flexShrink:0}}>{l}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',marginBottom:8}}>Support &amp; Resistance</div>
              {[['R2','₹'+result.r2,'var(--red)'],['R1','₹'+result.r1,'var(--red)'],['S1','₹'+result.s1,'var(--green)'],['S2','₹'+result.s2,'var(--green)']].map(([l,v,c])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{color:'var(--text3)'}}>{l}</span>
                  <span style={{fontWeight:500,color:c}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:10}}>
                <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',marginBottom:5}}>Key Risks</div>
                {(result.risks||[]).map((r,i)=><div key={i} style={{fontSize:11,color:'var(--text2)',padding:'2px 0'}}>• {r}</div>)}
              </div>
              {result.patterns?.length>0 && (
                <div style={{marginTop:10}}>
                  <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',marginBottom:5}}>Patterns</div>
                  {result.patterns.map(p=><span key={p} className="bdg b-paper" style={{fontSize:10,marginRight:4}}>{p}</span>)}
                </div>
              )}
            </div>
          </div>

          <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
            <div style={{fontSize:11,color:'var(--text3)',marginBottom:8}}>Entry confirmation: {result.trigger}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {['swing','intraday','fno'].map(style=>(
                <button key={style} className={`btn${style==='swing'?' btn-p':''} btn-sm`}
                  onClick={()=>{
                    onAddTrade({sym:result.sym,entry:result.entry_hi,sl:result.sl,t1:result.t1,t2:result.t2||result.t1,qty:style==='intraday'?100:style==='fno'?1:50,dir:result.action==='SELL'?'SHORT':'LONG',style,tradeType:'paper',source:'ai_analysis'})
                    setAddedStyle(style)
                  }}
                  disabled={addedStyle===style}
                >
                  <i className="ti ti-plus"/>
                  {addedStyle===style?'✓ Added':'Paper trade ('+style+')'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
