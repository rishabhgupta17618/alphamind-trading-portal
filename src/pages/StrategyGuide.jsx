import React from 'react'

export default function StrategyGuide() {
  const rows = [
    ['Time required','30 min/day','Full day (5–6 hrs)','2–8 hrs/day'],
    ['Min capital','₹50,000','₹25,000','₹1,00,000'],
    ['Recommended capital','₹2–5 Lakh','₹1–3 Lakh','₹5 Lakh+'],
    ['Holding period','2–15 days','Same day','Same day → weekly'],
    ['Leverage','Not needed','Up to 5×','Up to 50× (futures)'],
    ['Difficulty','★★☆ Medium','★★★ Hard','★★★★ Expert'],
    ['Overnight risk','Yes (gap risk)','None','Futures yes, options capped'],
    ['Win rate (realistic)','50–65%','45–55%','40–60%'],
    ['Monthly return','3–8%','2–10%','5–20%'],
    ['Max drawdown','10–20%','15–30%','20–50%'],
    ['Learning curve','3–6 months','12–24 months','18–36 months'],
    ['Suitable for','Beginners+','Intermediate+','Advanced only'],
  ]

  return (
    <div className="page">
      <div className="ph"><div><div className="pt">Strategy Guide</div><div className="ps">Understand all three trading styles before risking capital</div></div></div>

      <div className="card">
        <div className="ct">Side-by-Side Strategy Comparison</div>
        <div style={{overflowX:'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th style={{color:'var(--green)'}}>◎ Swing Trading</th>
                <th style={{color:'var(--amber)'}}>◉ Intraday</th>
                <th style={{color:'var(--purple)'}}>◈ F&O</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([p,s,i,f],idx)=>(
                <tr key={p} style={{background:idx%2===0?'var(--bg3)':'transparent'}}>
                  <td style={{color:'var(--text3)'}}>{p}</td>
                  <td style={{color:'var(--green)'}}>{s}</td>
                  <td style={{color:'var(--amber)'}}>{i}</td>
                  <td style={{color:'var(--purple)'}}>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="ct">Which Strategy Fits Your Situation?</div>
        {[
          ['I have a full-time job and 30 min/day','→ Start with Swing Trading','var(--green)'],
          ['I can watch markets all day, 6+ months experience','→ Intraday Trading','var(--amber)'],
          ['Complete beginner with ₹1–2L capital','→ Swing only. Paper trade 3 months first.','var(--green)'],
          ['I want to hedge my stock portfolio','→ Buy Nifty Put options (small size only)','var(--purple)'],
          ['I want fastest learning feedback','→ Paper intraday only — not live until swing is profitable','var(--amber)'],
          ['I want steady monthly income strategy','→ Options selling (iron condor) — advanced only','var(--purple)'],
        ].map(([q,a,c])=>(
          <div key={q} style={{padding:'9px 11px',background:'var(--bg3)',borderRadius:8,marginBottom:6}}>
            <div style={{fontSize:11,color:'var(--text3)',marginBottom:2}}>{q}</div>
            <div style={{fontSize:12,fontWeight:500,color:c}}>{a}</div>
          </div>
        ))}
      </div>

      <div className="g3">
        {[['swing','ti-trending-up','Swing','var(--green)','₹2–5L','3–8%/mo','Beginner friendly'],
          ['intraday','ti-bolt','Intraday','var(--amber)','₹1–3L','2–10%/mo','Intermediate+'],
          ['fno','ti-chart-bar','F&O','var(--purple)','₹5L+','5–20%/mo','Advanced only']].map(([,ic,nm,col,cap,ret,lvl])=>(
          <div key={nm} className="card" style={{borderTop:`2px solid ${col}`}}>
            <i className={`ti ${ic}`} style={{fontSize:20,color:col,marginBottom:8,display:'block'}}/>
            <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>{nm}</div>
            <div style={{fontSize:11,color:'var(--text3)',marginBottom:2}}>Capital: {cap}</div>
            <div style={{fontSize:11,color:'var(--text3)',marginBottom:8}}>Return target: {ret}</div>
            <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:'var(--bg3)',color:col}}>{lvl}</span>
          </div>
        ))}
      </div>

      <div className="al al-w">
        <i className="ti ti-alert-triangle"/>
        <div>
          <b>Honest Reality Check:</b> 80% of intraday traders and 90% of F&O traders lose money (SEBI 2023).
          Profitable trading requires a tested edge, strict risk management, and iron discipline.
          This paper trading phase exists to build that edge before risking real capital.
          Never trade money you cannot afford to lose entirely.
        </div>
      </div>
    </div>
  )
}
