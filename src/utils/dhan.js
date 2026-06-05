/**
 * Dhan API — All calls go through /api/dhan (server-side proxy)
 * This completely bypasses Dhan's CORS restrictions.
 */

const PROXY = '/api/dhan'

async function call(cid, tok, endpoint, method = 'GET', body = null) {
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid, tok, endpoint, method, body }),
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error || data.errorMessage || `Dhan API error ${res.status}`)
  }
  return data
}

export const dhan = {
  profile:    (cid, tok) => call(cid, tok, '/profile'),
  holdings:   (cid, tok) => call(cid, tok, '/holdings'),
  positions:  (cid, tok) => call(cid, tok, '/positions'),
  funds:      (cid, tok) => call(cid, tok, '/fundlimit'),
  orders:     (cid, tok) => call(cid, tok, '/orders'),
  trades:     (cid, tok, from, to, page = 0) =>
    call(cid, tok, `/tradehistory?from_date=${from}&to_date=${to}&page_number=${page}`),

  ltp:  (cid, tok, secIds) => call(cid, tok, '/marketfeed/ltp',  'POST', secIds),
  ohlc: (cid, tok, secIds) => call(cid, tok, '/marketfeed/ohlc', 'POST', secIds),

  historical: (cid, tok, secId, seg, from, to) =>
    call(cid, tok, '/charts/historical', 'POST', {
      securityId: secId, exchangeSegment: seg,
      instrument: 'EQUITY', expiryCode: 0,
      fromDate: from, toDate: to,
    }),

  intraday: (cid, tok, secId, seg, interval = '15') =>
    call(cid, tok, '/charts/intraday', 'POST', {
      securityId: secId, exchangeSegment: seg,
      instrument: 'EQUITY', interval,
    }),

  placeOrder: (cid, tok, order) =>
    call(cid, tok, '/orders', 'POST', { dhanClientId: cid, ...order }),

  cancelOrder: (cid, tok, orderId) =>
    call(cid, tok, `/orders/${orderId}`, 'DELETE'),

  modifyOrder: (cid, tok, orderId, updates) =>
    call(cid, tok, `/orders/${orderId}`, 'PUT', updates),
}

// NSE stocks with security IDs
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
  { s: 'KOTAKBANK',  id: '1922',  sg: 'NSE_EQ' },
  { s: 'HINDUNILVR', id: '1394',  sg: 'NSE_EQ' },
]

export const DEFAULT_RISK = {
  maxPositionSizePct:  5,
  dailyLossLimitPct:   2,
  maxOpenPositions:    5,
  maxCapitalDeployed:  50,
  stopLossRequired:    true,
  minRR:               1.5,
  autoTradeEnabled:    false,
  requireApproval:     true,
}
