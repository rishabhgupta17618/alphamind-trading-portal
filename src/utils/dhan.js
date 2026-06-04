// Dhan API v2 — Direct browser calls
const BASE = 'https://api.dhan.co/v2'

async function call(cid, tok, ep, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access-token': tok,
      'dhanClientId': cid,
    },
    mode: 'cors',
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${ep}`, opts)
  
  // Dhan returns 200 with error body sometimes
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  
  if (!res.ok) {
    const msg = data?.errorMessage || data?.message || `Dhan API ${res.status}`
    throw new Error(msg)
  }
  return data
}

export const dhan = {
  // Auth check
  profile:   (cid, tok) => call(cid, tok, '/profile'),
  
  // Portfolio
  holdings:  (cid, tok) => call(cid, tok, '/holdings'),
  positions: (cid, tok) => call(cid, tok, '/positions'),
  funds:     (cid, tok) => call(cid, tok, '/fundlimit'),
  orders:    (cid, tok) => call(cid, tok, '/orders'),
  trades:    (cid, tok, from, to, page = 0) => call(cid, tok, `/tradehistory?from_date=${from}&to_date=${to}&page_number=${page}`),

  // Market data
  ltp: (cid, tok, secIds) => call(cid, tok, '/marketfeed/ltp', 'POST', secIds),
  ohlc: (cid, tok, secIds) => call(cid, tok, '/marketfeed/ohlc', 'POST', secIds),
  historical: (cid, tok, secId, seg, from, to) => call(cid, tok, '/charts/historical', 'POST', {
    securityId: secId, exchangeSegment: seg, instrument: 'EQUITY',
    expiryCode: 0, fromDate: from, toDate: to,
  }),
  intraday: (cid, tok, secId, seg, interval = '15') => call(cid, tok, '/charts/intraday', 'POST', {
    securityId: secId, exchangeSegment: seg, instrument: 'EQUITY', interval,
  }),

  // Orders
  placeOrder: (cid, tok, order) => call(cid, tok, '/orders', 'POST', {
    dhanClientId: cid, ...order
  }),
  cancelOrder: (cid, tok, orderId) => call(cid, tok, `/orders/${orderId}`, 'DELETE'),
  modifyOrder: (cid, tok, orderId, updates) => call(cid, tok, `/orders/${orderId}`, 'PUT', updates),
}

// Known NSE stocks with security IDs
export const STOCKS = [
  { s: 'RELIANCE',   id: '1333',  sg: 'NSE_EQ' },
  { s: 'TCS',        id: '11536', sg: 'NSE_EQ' },
  { s: 'INFY',       id: '10999', sg: 'NSE_EQ' },
  { s: 'HDFCBANK',   id: '1330',  sg: 'NSE_EQ' },
  { s: 'BAJFINANCE', id: '317',   sg: 'NSE_EQ' },
  { s: 'ICICIBANK',  id: '4963',  sg: 'NSE_EQ' },
  { s: 'SBIN',       id: '3045',  sg: 'NSE_EQ' },
  { s: 'WIPRO',      id: '3787',  sg: 'NSE_EQ' },
  { s: 'AXISBANK',   id: '5900',  sg: 'NSE_EQ' },
  { s: 'LT',         id: '11483', sg: 'NSE_EQ' },
  { s: 'SUNPHARMA',  id: '3351',  sg: 'NSE_EQ' },
  { s: 'MARUTI',     id: '10942', sg: 'NSE_EQ' },
  { s: 'TATAMOTORS', id: '3456',  sg: 'NSE_EQ' },
  { s: 'HINDALCO',   id: '1363',  sg: 'NSE_EQ' },
  { s: 'KOTAKBANK',  id: '1922',  sg: 'NSE_EQ' },
]

// Default risk config
export const DEFAULT_RISK = {
  maxPositionSizePct: 5,       // Max % of capital per trade
  dailyLossLimitPct:  2,       // Stop trading if daily loss > X% of capital
  maxOpenPositions:   5,       // Max simultaneous open trades
  maxCapitalDeployed: 50,      // Max % of capital deployed at once
  stopLossRequired:   true,    // Every trade must have a SL
  minRR:              1.5,     // Minimum R:R ratio
  autoTradeEnabled:   false,   // Master switch for auto trading
  requireApproval:    true,    // Always require manual approval
}
