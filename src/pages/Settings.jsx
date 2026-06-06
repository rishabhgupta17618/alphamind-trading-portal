import React, { useState } from 'react'
import { lsSet, lsDel, KEYS } from '../utils/storage.js'
import { DEFAULT_RISK } from '../utils/dhan.js'

export default function Settings({ creds, setCreds, settings, setSettings, riskConfig, setRiskConfig, onLogout }) {
  const [cid, setCid]   = useState(creds.cid || '')
  const [tok, setTok]   = useState(creds.tok || '')
  const [akey, setAkey] = useState(creds.akey || '')
  const [rc, setRc]     = useState(riskConfig)
  const [saved, setSaved] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  const saveCredentials = () => {
    if (!cid || !tok || !akey) { alert('Please fill all fields'); return }
    const newCreds = { cid, tok, akey }
    setCreds(newCreds)
    lsSet(KEYS.CREDS, newCreds)
    setSaved('Credentials saved ✓')
    setTimeout(() => setSaved(''), 3000)
  }

  const saveAppSettings = (key, val) => {
    const updated = { ...settings, [key]: val }
    setSettings(updated)
    lsSet(KEYS.SETTINGS, updated)
  }

  const saveRiskConfig = () => {
    setRiskConfig(rc)
    lsSet(KEYS.RISK, rc)
    setSaved('Risk controls saved ✓')
    setTimeout(() => setSaved(''), 3000)
  }

  const clearAllData = () => {
    if (!confirm('This will delete all paper trades, journal entries, and settings. Are you sure?')) return
    Object.values(KEYS).forEach(k => lsDel(k))
    alert('All data cleared. Logging out.')
    onLogout()
  }

  const tabs = [
    ['profile', 'Profile & Credentials', 'ti-user'],
    ['appearance', 'Appearance', 'ti-palette'],
    ['risk', 'Risk Controls', 'ti-shield'],
    ['notifications', 'Notifications', 'ti-bell'],
    ['data', 'Data & Privacy', 'ti-database'],
  ]

  return (
    <div className="page">
      <div className="ph">
        <div><div className="pt">Settings</div><div className="ps">Manage your account, preferences, and risk controls</div></div>
        <button className="btn btn-d" onClick={onLogout}>
          <i className="ti ti-logout" /> Logout
        </button>
      </div>

      {saved && <div className="al al-s" style={{ marginBottom: 14 }}><i className="ti ti-check" />{saved}</div>}

      <div className="tabs">
        {tabs.map(([id, label, icon]) => (
          <div key={id} className={`tab${activeTab === id ? ' on' : ''}`} onClick={() => setActiveTab(id)}>
            <i className={`ti ${icon}`} style={{ marginRight: 5 }} />{label}
          </div>
        ))}
      </div>

      {/* PROFILE & CREDENTIALS */}
      {activeTab === 'profile' && (
        <div>
          <div className="card">
            <div className="ct"><i className="ti ti-user-circle" /> Profile</div>
            <div className="g2">
              <div className="met">
                <div className="ml">Dhan Client ID</div>
                <div className="mv" style={{ fontSize: 16 }}>{creds.cid || '—'}</div>
              </div>
              <div className="met">
                <div className="ml">Account Status</div>
                <div className="mv up" style={{ fontSize: 14 }}>✓ Connected</div>
                <div className="ms">Dhan broker account</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="ct"><i className="ti ti-key" /> API Credentials</div>
            <div className="al al-i" style={{ marginBottom: 14 }}>
              <i className="ti ti-lock" />
              <span>Credentials stored only in your browser. Sent directly to Dhan and Google APIs — never to any server.</span>
            </div>
            <div className="fr">
              <label className="fl">Dhan Client ID</label>
              <input placeholder="e.g. 1101954232" value={cid} onChange={e => setCid(e.target.value)} />
            </div>
            <div className="fr">
              <label className="fl">Dhan Access Token
                <span style={{ color: 'var(--amber)', marginLeft: 6, fontSize: 10 }}>⚠ Renew daily from web.dhan.co</span>
              </label>
              <input type="password" placeholder="eyJ0eXAiOiJKV1Qi…" value={tok} onChange={e => setTok(e.target.value)} />
            </div>
            <div className="fr">
              <label className="fl">Groq API Key</label>
              <input type="password" placeholder="gsk_…" value={akey} onChange={e => setAkey(e.target.value)} />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                100% free at console.groq.com → API Keys — 14,400 requests/day, no credit card ever
              </div>
            </div>
            <button className="btn btn-p" onClick={saveCredentials}><i className="ti ti-check" /> Save Credentials</button>
          </div>
        </div>
      )}

      {/* APPEARANCE */}
      {activeTab === 'appearance' && (
        <div className="card">
          <div className="ct"><i className="ti ti-palette" /> Appearance &amp; Theme</div>

          <div className="fr">
            <label className="fl">Theme</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {[['dark', 'Dark Mode', '🌙'], ['light', 'Light Mode', '☀️'], ['system', 'System Default', '💻']].map(([v, l, icon]) => (
                <div
                  key={v}
                  onClick={() => saveAppSettings('theme', v)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${settings.theme === v ? 'var(--green)' : 'var(--border)'}`,
                    background: settings.theme === v ? 'var(--gb)' : 'var(--bg3)',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 12, color: settings.theme === v ? 'var(--green)' : 'var(--text2)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="fr">
            <label className="fl">Accent Color</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {[['#00c896', 'Teal'], ['#4d9fff', 'Blue'], ['#a78bfa', 'Purple'], ['#f5a623', 'Amber'], ['#ff4d6a', 'Red']].map(([color, name]) => (
                <div
                  key={color}
                  onClick={() => saveAppSettings('accent', color)}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', background: color, cursor: 'pointer',
                    border: `3px solid ${settings.accent === color ? 'white' : 'transparent'}`,
                    boxShadow: settings.accent === color ? `0 0 0 2px ${color}` : 'none'
                  }}
                  title={name}
                />
              ))}
            </div>
          </div>

          <div className="fr">
            <label className="fl">Font Size</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {[['small', 'Small (12px)'], ['medium', 'Medium (13px)'], ['large', 'Large (15px)']].map(([v, l]) => (
                <button key={v} className={`btn btn-sm${settings.fontSize === v ? ' btn-p' : ''}`}
                  onClick={() => saveAppSettings('fontSize', v)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="fr">
            <label className="fl">Sidebar Width</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {[['compact', 'Compact'], ['normal', 'Normal'], ['wide', 'Wide']].map(([v, l]) => (
                <button key={v} className={`btn btn-sm${settings.sidebarWidth === v ? ' btn-p' : ''}`}
                  onClick={() => saveAppSettings('sidebarWidth', v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RISK CONTROLS */}
      {activeTab === 'risk' && (
        <div className="card">
          <div className="ct" style={{ color: 'var(--amber)' }}><i className="ti ti-shield" /> Risk Management Controls</div>
          <div className="al al-w" style={{ marginBottom: 14 }}>
            <i className="ti ti-alert-triangle" />
            These controls apply to Live Trading only. Paper trades are not affected.
          </div>
          <div className="g2">
            {[
              ['Max Position Size (% of capital)', 'maxPositionSizePct', 0.5, 0.5, 50, '%', 'Maximum % of available capital per single trade'],
              ['Daily Loss Limit (% of capital)', 'dailyLossLimitPct', 1, 0.5, 20, '%', 'Automatically pause trading when daily loss exceeds this'],
              ['Max Open Positions', 'maxOpenPositions', 1, 1, 20, '', 'Maximum number of simultaneously open live positions'],
              ['Max Capital Deployed (%)', 'maxCapitalDeployed', 10, 10, 100, '%', 'Never deploy more than this % of capital at once'],
              ['Minimum R:R Ratio', 'minRR', 0.5, 0.5, 5, ':1', 'Reject AI proposals with R:R below this threshold'],
            ].map(([label, key, step, min, max, unit, hint]) => (
              <div key={key} className="fr">
                <label className="fl">{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="number" value={rc[key]} min={min} max={max} step={step}
                    onChange={e => setRc(p => ({ ...p, [key]: parseFloat(e.target.value) }))} style={{ flex: 1 }} />
                  {unit && <span style={{ color: 'var(--text3)', fontSize: 12, flexShrink: 0 }}>{unit}</span>}
                </div>
                {hint && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{hint}</div>}
              </div>
            ))}
          </div>
          <div className="fr">
            <label className="fl">Require Manual Approval for Every Live Trade</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              {[true, false].map(v => (
                <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
                  <input type="radio" checked={rc.requireApproval === v} onChange={() => setRc(p => ({ ...p, requireApproval: v }))} />
                  {v ? '✓ Yes — Always ask me (Recommended)' : 'No — Auto-execute (Dangerous)'}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-p" onClick={saveRiskConfig}><i className="ti ti-check" /> Save Risk Controls</button>
            <button className="btn btn-sm" onClick={() => { setRc(DEFAULT_RISK); alert('Reset to defaults') }}>Reset defaults</button>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div className="ct"><i className="ti ti-bell" /> Notification Preferences</div>
          {[
            ['notifySignals', 'New AI trade signals generated'],
            ['notifyOrderFill', 'Order filled on Dhan'],
            ['notifyLossLimit', 'Daily loss limit approaching'],
            ['notifyWin', 'Paper trade closed as WIN'],
            ['notifyLoss', 'Paper trade closed as LOSS'],
            ['notifySyncFail', 'Dhan sync failure'],
          ].map(([key, label]) => (
            <div key={key} className="row" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{label}</span>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={settings[key] !== false} style={{ width: 'auto', marginRight: 8 }}
                  onChange={e => saveAppSettings(key, e.target.checked)} />
                <span style={{ fontSize: 12, color: settings[key] !== false ? 'var(--green)' : 'var(--text3)' }}>
                  {settings[key] !== false ? 'On' : 'Off'}
                </span>
              </label>
            </div>
          ))}
          <div className="al al-i" style={{ marginTop: 14 }}>
            <i className="ti ti-info-circle" />
            Browser notifications require permission. Some alerts are shown inline in the portal.
          </div>
        </div>
      )}

      {/* DATA & PRIVACY */}
      {activeTab === 'data' && (
        <div>
          <div className="card">
            <div className="ct"><i className="ti ti-database" /> Data Storage</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.9 }}>
              <b style={{ color: 'var(--text)' }}>Where your data lives:</b><br />
              All paper trades, journal entries, and settings are stored in <b>your browser's localStorage</b>.<br />
              Nothing is sent to any server — not even Vercel.<br />
              API calls go directly from your browser to <b>Dhan</b> and <b>Groq AI</b>.<br /><br />
              <b style={{ color: 'var(--text)' }}>Data persistence:</b><br />
              Trade history persists across logins and browser restarts.<br />
              Clearing browser data or using a different browser will lose local data.<br /><br />
              <b style={{ color: 'var(--text)' }}>To back up your data:</b><br />
              Open browser DevTools → Application → Local Storage → export the <code style={{ background: 'var(--bg3)', padding: '1px 5px', borderRadius: 3 }}>am_trades_v2</code> key.
            </div>
          </div>

          <div className="card" style={{ border: '1px solid var(--rbr)' }}>
            <div className="ct" style={{ color: 'var(--rt)' }}><i className="ti ti-trash" /> Danger Zone</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-d" onClick={() => {
                if (confirm('Clear all paper trades and journal entries? This cannot be undone.')) {
                  lsDel(KEYS.TRADES); lsDel(KEYS.JOURNAL)
                  alert('Trade history cleared. Please refresh.')
                }
              }}><i className="ti ti-trash" /> Clear Trade History</button>
              <button className="btn btn-d" onClick={clearAllData}>
                <i className="ti ti-alert-triangle" /> Clear All Data &amp; Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
