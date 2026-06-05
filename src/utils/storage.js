// Persistent storage utilities

export function lsGet(key, def = null) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : def
  } catch { return def }
}

export function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function lsDel(key) {
  try { localStorage.removeItem(key) } catch {}
}

// Keys
export const KEYS = {
  CREDS:       'am_creds_v3',
  TRADES:      'am_trades_v2',
  JOURNAL:     'am_journal_v2',
  SETTINGS:    'am_settings_v2',
  AUTH:        'am_auth_v2',
  OTP_LOCK:    'am_otp_lock',
  OTP_FAIL:    'am_otp_fail',
  RISK:        'am_risk_config',
  AUTO_CONFIG: 'am_auto_config',
}
