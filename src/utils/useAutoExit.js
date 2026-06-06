import { useEffect } from 'react'

/**
 * Auto-exit hook for paper trades.
 * Simulates price movement and auto-closes open paper trades at T1 or SL.
 * Intraday: 30s–2min, F&O: 1–5min, Swing: 2–8min simulation delay.
 */
export function useAutoExit(trades, closeTrade) {
  const openIds = trades
    .filter(t => t.status === 'OPEN' && t.tradeType === 'paper')
    .map(t => t.id)
    .join(',')

  useEffect(() => {
    const open = trades.filter(t => t.status === 'OPEN' && t.tradeType === 'paper')
    if (!open.length) return

    const timers = open.map(t => {
      const entry = parseFloat(t.entry)
      const sl    = parseFloat(t.sl)
      const t1    = parseFloat(t.t1)
      if (!entry || !sl || !t1) return null

      const range   = Math.abs(t1 - entry)
      const minMs   = t.style === 'intraday' ? 30000  : t.style === 'fno' ? 60000  : 120000
      const maxMs   = t.style === 'intraday' ? 120000 : t.style === 'fno' ? 300000 : 480000
      const delay   = minMs + Math.random() * (maxMs - minMs)
      const hitT1   = Math.random() < 0.55
      const isLong  = t.dir === 'LONG'
      const exitPrice = hitT1
        ? parseFloat((t1  + (Math.random() - 0.5) * range * 0.1).toFixed(2))
        : parseFloat((sl  - (isLong ? 1 : -1) * range * 0.05).toFixed(2))

      return setTimeout(() => closeTrade(t.id, exitPrice, true), delay)
    })

    return () => timers.forEach(t => t && clearTimeout(t))
  }, [openIds]) // eslint-disable-line react-hooks/exhaustive-deps
}
