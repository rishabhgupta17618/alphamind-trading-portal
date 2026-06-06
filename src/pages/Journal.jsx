import React, { useState } from 'react'
import { groqJSON } from '../utils/groq.js'

export default function Journal({ creds, journal, trades, onAdd }) {
  const [note, setNote]       = useState('')
  const [tag, setTag]         = useState('observation')
  const [loading, setL]       = useState(false)
  const [insights, setInsights] = useState(null)
  const [err, setErr]         = useState('')
  const [filter, setFilter]   = useState('all')

  const typeColors = {
    open: 'var(--bt)', win: 'var(--gt)', loss: 'var(--rt)',
    note: 'var(--text3)', observation: 'var(--purple)',
    lesson: 'var(--amber)', rule: 'var(--green)'
  }

  const filtered = filter === 'all' ? journal : journal.filter(e => e.type === filter)

  const addNote = () => {
    if (!note.trim()) return
    onAdd({ type: tag, note: note.trim() })
    setNote('')
  }

  const getInsights = async () => {
    setL(true); setErr('')
    try {
      const closed = trades.filter(t => t.status === 'CLOSED')
      const wins   = closed.filter(t => t.result === 'WIN')
      const losses = closed.filter(t => t.result === 'LOSS')
      const tp     = closed.reduce((s, t) => s + (t.pnl || 0), 0)
      const wp     = wins.reduce((s, t) => s + (t.pnl || 0), 0)
      const lp     = Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0))
      const wr     = closed.length ? Math.round(wins.length / closed.length * 100) : 0
      const pf     = lp > 0 ? (wp / lp).toFixed(2) : wins.length > 0 ? '∞' : '0'

      const r = await groqJSON(creds.akey,
        `Trading coach reviewing student paper trading journal.
Stats: ${closed.length} closed trades, ${wr}% win rate, P&L ₹${Math.round(tp)}, profit factor ${pf}
Avg win: ₹${wins.length ? Math.round(wp / wins.length) : 0} | Avg loss: ₹${losses.length ? Math.round(-lp / losses.length) : 0}
Recent losses: ${JSON.stringify(losses.slice(0, 5).map(t => ({ sym: t.sym, entry: t.entry, exit: t.exitP, pnl: t.pnl, style: t.style })))}
Journal notes: ${journal.filter(e => e.type === 'note' || e.type === 'lesson').slice(0, 5).map(e => e.note).join(' | ') || 'none'}
Return ONLY JSON:
{"summary":"2 sentences","strengths":["s1","s2"],"weaknesses":["w1","w2"],"common_mistakes":["m1"],"top3_improvements":[{"what":"action","why":"reason","how":"steps"}],"weekly_focus":"one specific focus","ready_score":0,"ready":false,"verdict":"one sentence","loss_patterns":"what patterns appear in losing trades"}`)
      setInsights(r)
    } catch (e) { setErr(e.message) }
    setL(false)
  }

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div className="pt">Trade Journal</div>
          <div className="ps">{journal.length} entries — trades auto-logged, notes manual</div>
        </div>
        <button className="btn" onClick={getInsights} disabled={loading}>
          <i className={`ti ti-sparkles${loading ? ' spin' : ''}`} />
          {loading ? 'Analysing…' : 'AI Insights'}
        </button>
      </div>

      {err && <div className="al al-e"><i className="ti ti-alert-circle" />{err}</div>}

      {/* AI Insights */}
      {insights && (
        <div className="card" style={{ border: '1px solid var(--gbr)', marginBottom: 14 }}>
          <div className="ct" style={{ color: 'var(--green)' }}><i className="ti ti-sparkles" /> AI Journal Analysis</div>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>{insights.summary}</p>
          <div className="g2" style={{ marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--gt)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Strengths</div>
              {(insights.strengths || []).map(s => <div key={s} style={{ fontSize: 12, color: 'var(--text2)', padding: '2px 0' }}>✓ {s}</div>)}
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--rt)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Weaknesses</div>
              {(insights.weaknesses || []).map(w => <div key={w} style={{ fontSize: 12, color: 'var(--text2)', padding: '2px 0' }}>✗ {w}</div>)}
            </div>
          </div>
          {insights.loss_patterns && (
            <div style={{ background: 'var(--rb)', border: '1px solid var(--rbr)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 12, color: 'var(--rt)' }}>
              <b>Loss pattern:</b> {insights.loss_patterns}
            </div>
          )}
          <div style={{ background: 'var(--bb)', border: '1px solid var(--bbr)', borderRadius: 8, padding: '9px 12px', marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--bt)', textTransform: 'uppercase', marginBottom: 3 }}>This week's focus</div>
            <div style={{ fontSize: 12, color: 'var(--text)' }}>{insights.weekly_focus}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Live trading readiness</span>
            <div style={{ flex: 1, height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: (insights.ready_score || 0) + '%', height: '100%', background: (insights.ready_score || 0) >= 70 ? 'var(--green)' : 'var(--amber)', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: (insights.ready_score || 0) >= 70 ? 'var(--green)' : 'var(--amber)', flexShrink: 0 }}>
              {insights.ready_score || 0}/100
            </span>
            <span className={`bdg b-${insights.ready ? 'buy' : 'hold'}`} style={{ flexShrink: 0 }}>{insights.verdict || '—'}</span>
          </div>
        </div>
      )}

      {/* Add note */}
      <div className="card">
        <div className="ct"><i className="ti ti-edit" /> Add Journal Entry</div>
        <div className="g2" style={{ marginBottom: 10 }}>
          <div className="fr">
            <label className="fl">Entry type</label>
            <select value={tag} onChange={e => setTag(e.target.value)}>
              <option value="observation">Market Observation</option>
              <option value="lesson">Lesson Learned</option>
              <option value="rule">Trading Rule</option>
              <option value="note">General Note</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            rows={2}
            placeholder="Write your observation, lesson, or trading rule..."
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ flex: 1, resize: 'vertical' }}
          />
          <button className="btn btn-p" style={{ alignSelf: 'flex-end' }} onClick={addNote}>
            <i className="ti ti-plus" /> Add
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['all', 'All'], ['win', 'Wins'], ['loss', 'Losses'], ['open', 'Trade Opens'], ['lesson', 'Lessons'], ['observation', 'Observations'], ['rule', 'Rules']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm${filter === v ? ' btn-p' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {/* Entries */}
      <div className="card">
        <div className="ct">
          <span><i className="ti ti-notebook" /> Journal Entries ({filtered.length})</span>
        </div>
        {filtered.length === 0
          ? <div style={{ color: 'var(--text3)', fontSize: 12 }}>No entries yet. Trades are auto-logged; add notes manually above.</div>
          : filtered.map(e => (
            <div key={e.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.4px', color: typeColors[e.type] || 'var(--text3)' }}>
                  {(e.type || 'note').replace(/_/g, ' ')}
                </span>
                {e.sym && <span style={{ fontSize: 11, fontWeight: 600 }}>{e.sym}</span>}
                {e.pnl != null && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: e.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {e.pnl >= 0 ? '+' : ''}₹{Math.abs(e.pnl).toLocaleString('en-IN')}
                  </span>
                )}
                <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>
                  {new Date(e.ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{e.note}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
