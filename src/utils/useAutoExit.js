import { useEffect, useRef } from 'react'

// IST offset: UTC+5:30
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function nowIST() {
  return new Date(Date.now() + IST_OFFSET_MS)
}

function isMarketOpen() {
  const now = nowIST()
  const day = now.getUTCDay()
  if (day === 0 || day === 6) return false
  const totalMin = now.getUTCHours() * 60 + now.getUTCMinutes()
  return totalMin >= 9 * 60 + 15 && totalMin < 15 * 60 + 30
}

function tradingDaysSince(openedAt) {
  const cursor = new Date(openedAt)
  cursor.setUTCHours(0, 0, 0, 0)
  const end = new Date(nowIST())
  end.setUTCHours(0, 0, 0, 0)
  let count = 0
  while (cursor < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    const d = cursor.getUTCDay()
    if (d >= 1 && d <= 5) count++
  }
  return count
}

/**
 * Hold period rules per style:
 *
 * Intraday : min 0 days  — must exit same day by 15:20 IST
 *            max 0 days  — if somehow carried to next day, exit immediately at open
 *
 * Swing    : min 2 days  — AI signal needs at least 2 days to play out
 *            max 15 days — standard swing trade window (3 trading weeks)
 *            exit price  — simulated between SL and T2 based on days held:
 *                          days 2–5  → 55% T1, 45% SL  (early, uncertainty high)
 *                          days 6–10 → 65% T1, 35% SL  (trend confirmation phase)
 *                          days 11–15→ 50% T1, 50% SL  (trade going stale)
 *                          day 15+   → force exit at current simulated price
 *
 * F&O      : min 1 day   — derivatives need at least 1 day
 *            max 5 days  — options lose value fast; 1 trading week max
 *            exit price  → same probability curve as swing but compressed
 */
const HOLD = {
  intraday: { min: 0, max: 0 },
  swing:    { min: 2, max: 15 },
  fno:      { min: 1, max: 5  },
}

function winProbability(style, daysHeld) {
  if (style === 'intraday') return 0.55
  if (style === 'fno') {
    if (daysHeld <= 2) return 0.55
    if (daysHeld <= 4) return 0.60
    return 0.45  // F&O going stale — theta decay hurts
  }
  // swing
  if (daysHeld <= 5)  return 0.55
  if (daysHeld <= 10) return 0.65
  return 0.50  // stale swing
}

function simulateExitPrice(t, daysHeld) {
  const entry  = parseFloat(t.entry)
  const sl     = parseFloat(t.sl)
  const t1     = parseFloat(t.t1)
  const t2     = parseFloat(t.t2) || t1
  const isLong = t.dir === 'LONG'
  const range  = Math.abs(t1 - entry)
  const noise  = (Math.random() - 0.5) * range * 0.08
  const hitWin = Math.random() < winProbability(t.style, daysHeld)

  if (hitWin) {
    // Between T1 and T2 depending on how long it ran
    const toward = daysHeld >= 10 ? t2 : t1
    return parseFloat((toward + noise).toFixed(2))
  } else {
    return parseFloat((sl - (isLong ? 1 : -1) * Math.abs(noise)).toFixed(2))
  }
}

export function useAutoExit(trades, closeTrade) {
  const timerRef = useRef(null)

  const openIds = trades
    .filter(t => t.status === 'OPEN' && t.tradeType === 'paper')
    .map(t => t.id)
    .join(',')

  useEffect(() => {
    const open = trades.filter(t => t.status === 'OPEN' && t.tradeType === 'paper')
    if (!open.length) return

    function checkAndExit() {
      if (!isMarketOpen()) return

      const now = Date.now()
      open.forEach(t => {
        if (!t.entry || !t.sl || !t.t1) return

        const daysHeld = tradingDaysSince(t.openedAt || t.createdAt || now)
        const hold     = HOLD[t.style] ?? HOLD.swing
        const nowIST_  = nowIST()
        const totalMin = nowIST_.getUTCHours() * 60 + nowIST_.getUTCMinutes()

        let shouldExit = false
        let exitNote   = ''

        if (t.style === 'intraday') {
          // Same-day square-off window: 15:00–15:20 IST
          if (totalMin >= 15 * 60 && totalMin < 15 * 60 + 20 && daysHeld === 0) {
            shouldExit = true; exitNote = 'intraday_squareoff'
          }
          // Carried overnight — exit immediately at market open
          if (daysHeld >= 1) {
            shouldExit = true; exitNote = 'intraday_carried_overnight'
          }
        } else {
          // Within min hold — don't exit yet
          if (daysHeld < hold.min) return

          // Past max hold — force exit regardless
          if (daysHeld >= hold.max) {
            shouldExit = true; exitNote = 'max_hold_reached'
          } else {
            // Between min and max: probabilistic exit each day (not every 60s check)
            // Only attempt once per trading day using a daily exit window (14:00–15:00 IST)
            if (totalMin >= 14 * 60 && totalMin < 15 * 60) {
              // ~40% chance of exiting each day in the window (spread across the hour)
              if (Math.random() < 0.007) { // ~0.7% per minute × 60 min ≈ 40% per day
                shouldExit = true; exitNote = 'probabilistic_exit'
              }
            }
          }
        }

        if (shouldExit) {
          const exitPrice = simulateExitPrice(t, daysHeld)
          closeTrade(t.id, exitPrice, true, exitNote)
        }
      })
    }

    checkAndExit()
    timerRef.current = setInterval(checkAndExit, 60 * 1000)
    return () => clearInterval(timerRef.current)

  }, [openIds]) // eslint-disable-line react-hooks/exhaustive-deps
}
