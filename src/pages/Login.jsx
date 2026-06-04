import React, { useState, useEffect, useRef } from 'react'
import { lsGet, lsSet, lsDel, KEYS } from '../utils/storage.js'
import { generateOTP, isLockedOut, getFailCount, recordFail, resetFails, formatLockRemaining } from '../utils/otp.js'
import { dhan } from '../utils/dhan.js'

export default function Login({ onLogin }) {
  const [step, setStep] = useState('creds')  // creds | otp | locked
  const [cid, setCid]   = useState('')
  const [tok, setTok]   = useState('')
  const [gkey, setGkey] = useState('')
  const [otp, setOtp]   = useState('')
  const [genOtp, setGenOtp] = useState('')
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)
  const [lockInfo, setLockInfo] = useState(null)
  const [failCount, setFailCount] = useState(0)
  const [otpSent, setOtpSent]   = useState(false)
  const [timer, setTimer]       = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    // Pre-fill saved creds
    const saved = lsGet(KEYS.CREDS)
    if (saved) { setCid(saved.cid || ''); setTok(saved.tok || ''); setGkey(saved.gkey || '') }

    // Check lockout
    const lock = isLockedOut()
    if (lock?.locked) { setStep('locked'); setLockInfo(lock) }
    setFailCount(getFailCount())
  }, [])

  // Countdown timer for lock remaining
  useEffect(() => {
    if (step === 'locked' && lockInfo) {
      timerRef.current = setInterval(() => {
        const lock = isLockedOut()
        if (!lock?.locked) { setStep('creds'); setLockInfo(null); clearInterval(timerRef.current) }
        else setLockInfo(lock)
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [step, lockInfo])

  // OTP expiry countdown
  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const t = setInterval(() => setTimer(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 }), 1000)
      return () => clearInterval(t)
    }
  }, [step, timer])

  const validateCreds = async () => {
    if (!cid.trim() || !tok.trim() || !gkey.trim()) {
      setErr('Please fill in all three fields.'); return
    }
    setLoading(true); setErr('')
    try {
      // Validate Gemini key
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${gkey.trim()}`)
      if (!r.ok) throw new Error('Invalid Gemini API key — check and try again')
    } catch (e) {
      setLoading(false)
      setErr(e.message || 'Could not verify Gemini API key')
      return
    }
    setLoading(false)
    sendOTP()
  }

  const sendOTP = () => {
    const code = generateOTP()
    setGenOtp(code)
    setOtpSent(true)
    setTimer(600) // 10 min
    setStep('otp')
    setErr('')
    // In production: call backend to SMS/email the OTP
    // For now show it in the UI since we have no backend
    console.log(`[DEV] OTP: ${code}`) // visible in browser console
  }

  const verifyOTP = () => {
    if (!otp.trim()) { setErr('Please enter the OTP.'); return }

    // Check lockout first
    const lock = isLockedOut()
    if (lock?.locked) { setStep('locked'); setLockInfo(lock); return }

    if (timer === 0) { setErr('OTP expired. Click Resend OTP.'); return }

    if (otp.trim() !== genOtp) {
      const result = recordFail()
      setFailCount(getFailCount())
      if (result.locked) {
        setStep('locked')
        setLockInfo(isLockedOut())
      } else {
        setErr(`Incorrect OTP. ${result.remaining} attempt${result.remaining !== 1 ? 's' : ''} remaining.`)
      }
      setOtp('')
      return
    }

    // Correct OTP
    resetFails()
    const creds = { cid: cid.trim(), tok: tok.trim(), gkey: gkey.trim() }
    lsSet(KEYS.CREDS, creds)
    lsSet(KEYS.AUTH, { loggedIn: true, at: Date.now() })
    onLogin(creds)
  }

  if (step === 'locked') {
    const remaining = lockInfo?.remaining || 0
    return (
      <div className="ob-wrap">
        <div className="ob-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>Account Locked</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.7 }}>
            Too many incorrect OTP attempts.<br />
            Please try again after:
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--amber)', fontFamily: 'monospace', marginBottom: 20 }}>
            {formatLockRemaining(remaining)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Lock resets automatically</div>
        </div>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <div className="ob-wrap">
        <div className="ob-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div className="sb-icon"><i className="ti ti-chart-line" /></div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>AlphaMind</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20, letterSpacing: '.5px' }}>VERIFY YOUR IDENTITY</div>

          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
              <i className="ti ti-device-mobile" style={{ marginRight: 6, color: 'var(--green)' }} />
              OTP sent to <b style={{ color: 'var(--text)' }}>+91 82788 17918</b>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              <i className="ti ti-mail" style={{ marginRight: 6, color: 'var(--green)' }} />
              OTP sent to <b style={{ color: 'var(--text)' }}>rishabhgupta17618@gmail.com</b>
            </div>
          </div>

          {/* DEV MODE: show OTP since no backend */}
          <div style={{ background: 'var(--ab)', border: '1px solid var(--abr)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--at)' }}>
            <i className="ti ti-info-circle" style={{ marginRight: 6 }} />
            <b>Developer mode:</b> OTP is <b style={{ fontSize: 15, letterSpacing: 3 }}>{genOtp}</b>
            <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text3)' }}>
              (Remove this in production when backend SMS/email is configured)
            </div>
          </div>

          <div className="fr">
            <label className="fl">Enter 6-digit OTP</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="_ _ _ _ _ _"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && verifyOTP()}
              style={{ fontSize: 22, letterSpacing: 8, textAlign: 'center', fontFamily: 'monospace' }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 11, color: 'var(--text3)' }}>
            <span style={{ color: timer < 60 ? 'var(--red)' : 'var(--text3)' }}>
              {timer > 0 ? `Expires in ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}` : 'OTP expired'}
            </span>
            <span style={{ color: 'var(--red)' }}>
              {failCount > 0 ? `${3 - failCount} attempt${3 - failCount !== 1 ? 's' : ''} remaining` : ''}
            </span>
          </div>

          {err && (
            <div className="al al-e" style={{ marginBottom: 12 }}>
              <i className="ti ti-alert-circle" />{err}
            </div>
          )}

          <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }} onClick={verifyOTP}>
            <i className="ti ti-shield-check" /> Verify OTP &amp; Login
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setStep('creds'); setOtp(''); setErr('') }}>
              <i className="ti ti-arrow-left" /> Back
            </button>
            <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={sendOTP} disabled={timer > 540}>
              <i className="ti ti-refresh" /> Resend OTP
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ob-wrap">
      <div className="ob-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div className="sb-icon"><i className="ti ti-chart-line" /></div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>AlphaMind</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 20, letterSpacing: '.5px' }}>AI TRADING PORTAL · DHAN BROKER</div>

        <div className="fr">
          <label className="fl">Dhan Client ID</label>
          <input placeholder="e.g. 1101954232" value={cid} onChange={e => setCid(e.target.value)} />
        </div>
        <div className="fr">
          <label className="fl">Dhan Access Token</label>
          <input type="password" placeholder="eyJ0eXAiOiJKV1Qi…" value={tok} onChange={e => setTok(e.target.value)} />
        </div>
        <div className="fr">
          <label className="fl">Google Gemini API Key</label>
          <input type="password" placeholder="AIzaSy…" value={gkey} onChange={e => setGkey(e.target.value)} />
        </div>

        {err && (
          <div className="al al-e" style={{ marginBottom: 12 }}>
            <i className="ti ti-alert-circle" />{err}
          </div>
        )}

        <button className="btn btn-p" style={{ width: '100%', justifyContent: 'center' }} onClick={validateCreds} disabled={loading}>
          <i className={`ti ti-${loading ? 'refresh spin' : 'lock-open'}`} />
          {loading ? 'Verifying…' : 'Continue to OTP Verification'}
        </button>

        <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10, fontSize: 12, color: 'var(--text3)', lineHeight: 1.9 }}>
          <b style={{ color: 'var(--text2)' }}>Where to find your credentials:</b><br />
          <b style={{ color: 'var(--text2)' }}>Dhan:</b> web.dhan.co → My Profile → API Access → Generate Token<br />
          <b style={{ color: 'var(--text2)' }}>Gemini:</b> aistudio.google.com/app/apikey → Create API Key
        </div>
      </div>
    </div>
  )
}
