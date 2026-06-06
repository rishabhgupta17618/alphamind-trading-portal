import React, { useState, useEffect } from 'react'
import { lsGet, lsSet, KEYS } from '../utils/storage.js'

const PIN_KEY   = 'alphamind_pin'
const MAX_FAILS = 5
const LOCK_MS   = 15 * 60 * 1000   // 15-minute lockout after 5 wrong PINs

export default function Login({ onLogin }) {
  const [step, setStep]       = useState('creds')  // 'creds' | 'setpin' | 'pin' | 'locked'
  const [cid, setCid]         = useState('')
  const [tok, setTok]         = useState('')
  const [akey, setAkey]       = useState('')        // Groq API key
  const [pin, setPin]         = useState('')
  const [pin2, setPin2]       = useState('')        // confirm PIN (set step)
  const [err, setErr]         = useState('')
  const [loading, setLoading] = useState(false)
  const [fails, setFails]     = useState(0)
  const [lockUntil, setLockUntil] = useState(null)
  const [lockLeft, setLockLeft]   = useState(0)

  // Load saved creds + check for existing PIN
  useEffect(() => {
    const saved = lsGet(KEYS.CREDS)
    if (saved) {
      setCid(saved.cid || '')
      setTok(saved.tok || '')
      setAkey(saved.akey || '')
    }
    const lock = JSON.parse(localStorage.getItem('alphamind_lock') || 'null')
    if (lock && Date.now() < lock.until) {
      setLockUntil(lock.until); setStep('locked')
    }
    const f = parseInt(localStorage.getItem('alphamind_fails') || '0')
    setFails(f)
  }, [])

  // Lock countdown
  useEffect(() => {
    if (step !== 'locked') return
    const t = setInterval(() => {
      const left = lockUntil - Date.now()
      if (left <= 0) {
        clearInterval(t)
        localStorage.removeItem('alphamind_lock')
        localStorage.setItem('alphamind_fails', '0')
        setFails(0); setStep('creds'); setLockUntil(null)
      } else {
        setLockLeft(left)
      }
    }, 500)
    return () => clearInterval(t)
  }, [step, lockUntil])

  const fmtTime = ms => {
    const m = Math.floor(ms / 60000)
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
    return `${m}:${s}`
  }

  // Step 1 — validate credentials, then go to PIN
  const handleContinue = async () => {
    if (!cid.trim() || !tok.trim() || !akey.trim()) {
      setErr('Please fill in all three fields.'); return
    }
    setLoading(true); setErr('')
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${akey.trim()}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Reply with exactly: {"ok":true}' }],
          max_tokens: 10,
        })
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error('Invalid Groq API key: ' + (e?.error?.message || `HTTP ${res.status}`))
      }
    } catch (e) {
      setLoading(false)
      setErr(e.message || 'Could not verify Groq API key')
      return
    }
    setLoading(false)
    // Check if PIN already set
    const hasPin = !!localStorage.getItem(PIN_KEY)
    setStep(hasPin ? 'pin' : 'setpin')
    setPin(''); setPin2('')
  }

  // Step 2a — set a new PIN
  const handleSetPin = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setErr('PIN must be exactly 4 digits.'); return
    }
    if (pin !== pin2) {
      setErr('PINs do not match.'); return
    }
    localStorage.setItem(PIN_KEY, pin)
    doLogin()
  }

  // Step 2b — verify existing PIN
  const handleVerifyPin = () => {
    const stored = localStorage.getItem(PIN_KEY)
    if (pin === stored) {
      localStorage.setItem('alphamind_fails', '0')
      doLogin()
    } else {
      const newFails = fails + 1
      setFails(newFails)
      localStorage.setItem('alphamind_fails', String(newFails))
      if (newFails >= MAX_FAILS) {
        const until = Date.now() + LOCK_MS
        localStorage.setItem('alphamind_lock', JSON.stringify({ until }))
        setLockUntil(until); setStep('locked')
      } else {
        setErr(`Incorrect PIN. ${MAX_FAILS - newFails} attempt${MAX_FAILS - newFails !== 1 ? 's' : ''} remaining.`)
        setPin('')
      }
    }
  }

  const doLogin = () => {
    const creds = { cid: cid.trim(), tok: tok.trim(), akey: akey.trim() }
    lsSet(KEYS.CREDS, creds)
    lsSet(KEYS.AUTH, { loggedIn: true, at: Date.now() })
    onLogin(creds)
  }


  // ── LOCKED ───────────────────────────────────────────────────
  if (step === 'locked') return (
    <div className="ob-wrap">
      <div className="ob-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)', marginBottom: 10 }}>
          Too Many Wrong PINs
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.7 }}>
          Account locked temporarily for security.
        </div>
        <div style={{
          fontSize: 40, fontWeight: 700, color: 'var(--amber)', fontFamily: 'monospace',
          letterSpacing: 4, background: 'var(--bg3)', padding: '14px 24px',
          borderRadius: 12, marginBottom: 20
        }}>
          {fmtTime(lockLeft)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>Unlocks automatically.</div>
      </div>
    </div>
  )

  // ── SET PIN ──────────────────────────────────────────────────
  if (step === 'setpin') return (
    <div className="ob-wrap">
      <div className="ob-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div className="sb-icon"><i className="ti ti-chart-line" /></div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>AlphaMind</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 22, letterSpacing: '.5px' }}>
          SET YOUR LOGIN PIN
        </div>
        <div className="al al-s" style={{ marginBottom: 16 }}>
          <i className="ti ti-info-circle" />
          Create a 4-digit PIN. You'll use this every time you log in.
        </div>
        <div className="fr">
          <label className="fl">New 4-Digit PIN</label>
          <input
            type="password" inputMode="numeric" maxLength={4}
            placeholder="• • • •" value={pin}
            onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setErr('') }}
            style={{ fontSize: 24, letterSpacing: 10, textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }}
          />
        </div>
        <div className="fr">
          <label className="fl">Confirm PIN</label>
          <input
            type="password" inputMode="numeric" maxLength={4}
            placeholder="• • • •" value={pin2}
            onChange={e => { setPin2(e.target.value.replace(/\D/g, '')); setErr('') }}
            onKeyDown={e => e.key === 'Enter' && handleSetPin()}
            style={{ fontSize: 24, letterSpacing: 10, textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }}
          />
        </div>
        {err && <div className="al al-e" style={{ marginBottom: 14 }}><i className="ti ti-alert-circle" />{err}</div>}
        <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleSetPin} disabled={pin.length !== 4 || pin2.length !== 4}>
          <i className="ti ti-lock" /> Set PIN &amp; Login
        </button>
        <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          onClick={() => { setStep('creds'); setErr('') }}>
          <i className="ti ti-arrow-left" /> Back
        </button>
      </div>
    </div>
  )

  // ── ENTER PIN ────────────────────────────────────────────────
  if (step === 'pin') return (
    <div className="ob-wrap">
      <div className="ob-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div className="sb-icon"><i className="ti ti-chart-line" /></div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>AlphaMind</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 22, letterSpacing: '.5px' }}>
          ENTER YOUR PIN TO CONTINUE
        </div>
        <div className="fr">
          <label className="fl">4-Digit PIN</label>
          <input
            autoFocus
            type="password" inputMode="numeric" maxLength={4}
            placeholder="• • • •" value={pin}
            onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setErr('') }}
            onKeyDown={e => e.key === 'Enter' && handleVerifyPin()}
            style={{ fontSize: 24, letterSpacing: 10, textAlign: 'center', fontFamily: 'monospace', fontWeight: 700 }}
          />
        </div>
        {fails > 0 && (
          <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 10 }}>
            ⚠ {MAX_FAILS - fails} attempt{MAX_FAILS - fails !== 1 ? 's' : ''} remaining before lockout
          </div>
        )}
        {err && <div className="al al-e" style={{ marginBottom: 14 }}><i className="ti ti-alert-circle" />{err}</div>}
        <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
          onClick={handleVerifyPin} disabled={pin.length !== 4}>
          <i className="ti ti-shield-check" /> Unlock
        </button>
        <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { setStep('creds'); setPin(''); setErr('') }}>
          <i className="ti ti-arrow-left" /> Change Credentials
        </button>
      </div>
    </div>
  )

  // ── CREDENTIALS ──────────────────────────────────────────────
  return (
    <div className="ob-wrap">
      <div className="ob-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div className="sb-icon"><i className="ti ti-chart-line" /></div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>AlphaMind</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 22, letterSpacing: '.5px' }}>
          AI TRADING PORTAL · DHAN BROKER
        </div>

        <div className="fr">
          <label className="fl">Dhan Client ID</label>
          <input placeholder="e.g. 1101954232" value={cid}
            onChange={e => setCid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleContinue()} />
        </div>
        <div className="fr">
          <label className="fl">Dhan Access Token</label>
          <input type="password" placeholder="eyJ0eXAiOiJKV1Qi…" value={tok}
            onChange={e => setTok(e.target.value)} />
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Get from web.dhan.co → My Profile → API Access → Generate Token
          </div>
        </div>
        <div className="fr">
          <label className="fl">Groq API Key</label>
          <input type="password" placeholder="gsk_…" value={akey}
            onChange={e => setAkey(e.target.value)} />
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            100% free at <a href="https://console.groq.com" target="_blank" rel="noreferrer"
              style={{ color: 'var(--green)' }}>console.groq.com</a> → API Keys — no credit card ever
          </div>
        </div>

        {err && <div className="al al-e" style={{ marginBottom: 14 }}><i className="ti ti-alert-circle" />{err}</div>}

        <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleContinue} disabled={loading}>
          <i className={`ti ti-${loading ? 'refresh spin' : 'lock-open'}`} />
          {loading ? 'Verifying…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
