// Persistent storage utilities — local + cloud sync via JSONBin.io (free, no signup needed per bin)
// Cloud sync: trades persist across devices using a shared bin ID derived from Dhan Client ID

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
  TRADES:      'am_trades_v3',
  JOURNAL:     'am_journal_v3',
  SETTINGS:    'am_settings_v2',
  AUTH:        'am_auth_v2',
  RISK:        'am_risk_config',
  AUTO_CONFIG: 'am_auto_config',
  BIN_ID:      'am_bin_id',        // JSONBin bin ID for this user
}

const BIN_API = 'https://api.jsonbin.io/v3'
// Free master key — read-only for bins; users create their own bin on first sync
// We use the client ID as a collision-resistant bin name lookup via a meta bin

// Create a new bin for this user (called once on first sync)
export async function createBin(clientId, initialData) {
  try {
    const res = await fetch(`${BIN_API}/b`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Bin-Name': `alphamind_${clientId}`, 'X-Bin-Private': 'false' },
      body: JSON.stringify(initialData)
    })
    const d = await res.json()
    return d?.metadata?.id || null
  } catch { return null }
}

// Update bin with latest trades + journal
export async function syncToCloud(binId, data) {
  try {
    await fetch(`${BIN_API}/b/${binId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return true
  } catch { return false }
}

// Fetch latest from cloud
export async function fetchFromCloud(binId) {
  try {
    const res = await fetch(`${BIN_API}/b/${binId}/latest`)
    const d = await res.json()
    return d?.record || null
  } catch { return null }
}
