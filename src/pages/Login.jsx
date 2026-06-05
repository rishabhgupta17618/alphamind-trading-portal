import React, { useState, useEffect, useRef } from 'react'
import { lsGet, lsSet, lsDel, KEYS } from '../utils/storage.js'
import { generateOTP, isLockedOut, getFailCount, recordFail, resetFails, formatLockRemaining } from '../utils/otp.js'
import { sendOTPviaServer } from '../utils/otpService.js'

export default function Login({ onLogin }) {
  const [step, setStep]       = useState('creds')
  const [cid, setCid]         = useState('')
  const [tok, setTok]         = useState('')
  const [gkey, setGkey]       = useState('')
  const [otp, setOtp]         = useState('')
  const [genOtp, setGenOtp]   = useState('')
  const [err, setErr]         = useState('')
  const [info, setInfo]       = useState('')
  const [loading, setLoading] = useState(false)
  const [lockInfo, setLockInfo]   = useState(null)
  const [failCount, setFailCount] = useState(0)
  const [timer, setTimer]     = useState(0)
  const [sending, setSending] = useState(false)
  const timerRef = useRef(null)
  const otpRef   = useRef(null)

  useEffect(() => {
    const saved = lsGet(KEYS.CREDS)
    if (saved) { setCid(saved.cid || ''); setTok(saved.tok || ''); setGkey(saved.gkey || '') }
    const lock = isLockedOut()
    if (lock?.locked) { setStep('locked'); setLockInfo(lock) }
    setFailCount(getFailCount())
  }, [])

  // Lock countdown
  useEffect(() => {
    if (step === 'locked') {
      timerRef.current = setInterval(() => {
        const lock = isLockedOut()
        if (!lock?.locked) { setStep('creds'); setLockInfo(null); clearInterval(timerRef.current) }
        else setLockInfo(lock)
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [step])

  // OTP expiry countdown
  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const t = setInterval(() => setTimer(p => {
        if (p <= 1) { clearInterval(t); return 0 }
        return p - 1
      }), 1000)
      return () => clearInterval(t)
    }
  }, [step, timer])

  // Focus OTP input when step changes
  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRef.current?.focus(), 100)
  }, [step])

  const validateAndSendOTP = async () => {
    if (!cid.trim() || !tok.trim() || !gkey.trim()) {
      setErr('Please fill in all three fields.'); return
    }
    setLoading(true); setErr(''); setInfo('')
    try {
      // Validate Gemini key via proxy
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Reply with exactly this JSON: {"ok":true}',
          maxTokens: 20,
          apiKey: gkey.trim()
        })
      })
      const data = await res.json()
      if (data.error) throw new Error('Invalid Gemini API key: ' + data.error)
    } catch (e) {
      setLoading(false)
      setErr(e.message || 'Could not verify Gemini API key')
      return
    }
    setLoading(false)
    await sendOTP()
  }

  const sendOTP = async () => {
    setSending(true); setErr(''); setInfo('')
    const code = generateOTP()
    setGenOtp(code)
    setTimer(600)

    // Send via backend (real email + SMS)
    const result = await sendOTPviaServer(code)

    if (result.success) {
      const channels = []
      if (result.email?.sent) channels.push('email')
      if (result.sms?.sent)   channels.push('SMS')
      setInfo(`OTP sent via ${channels.join(' and ')} to your registered contact`)
    } else {
      // Still show the step but warn about delivery
      setErr('OTP delivery failed: ' + (result.error || 'Check environment variables on Vercel'))
    }

    setStep('otp')
    setSending(false)
  }

  const verifyOTP = () => {
    if (!otp.trim()) { setErr('Please enter the OTP.'); return }
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
        setErr(`Incorrect OTP. ${result.remaining} attempt${result.remaining !== 1 ? 's' : ''} remaining before 24-hour lockout.`)
      }
      setOtp('')
      return
    }

    // Correct OTP — log in
    resetFails()
    const creds = { cid: cid.trim(), tok: tok.trim(), gkey: gkey.trim() }
    lsSet(KEYS.CREDS, creds)
    lsSet(KEYS.AUTH, { loggedIn: true, at: Date.now() })
    onLogin(creds)
  }

  // ── LOCKED SCREEN ────────────────────────────────────────────
  if (step === 'locked') {
    const remaining = lockInfo?.remaining || 0
    return (
      <div className="ob-wrap">
        <div className="ob-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)', marginBottom: 10 }}>
            Account Temporarily Locked
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.7 }}>
            Too many incorrect OTP attempts.<br />Your account is locked for security.
          </div>
          <div style={{
            fontSize: 42, fontWeight: 700, color: 'var(--amber)',
            fontFamily: 'monospace', letterSpacing: 4, marginBottom: 24,
            background: 'var(--bg3)', padding: '16px 24px', borderRadius: 12
          }}>
            {formatLockRemaining(remaining)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
            Lock resets automatically after 24 hours.<br />
            Contact support if you believe this is an error.
          </div>
        </div>
      </div>
    )
  }

  // ── OTP SCREEN ────────────────────────────────────────────────
  if (step === 'otp') {
    const mins = Math.floor(timer / 60)
    const secs = String(timer % 60).padStart(2, '0')
    return (
      <div className="ob-wrap">
        <div className="ob-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div className="sb-icon"><i className="ti ti-chart-line" /></div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>AlphaMind</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 22, letterSpacing: '.5px' }}>
            VERIFY YOUR IDENTITY
          </div>

          {/* Delivery confirmation */}
          <div style={{
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 18
          }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, fontWeight: 500 }}>
              OTP sent to your registered contacts:
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
              <i className="ti ti-device-mobile" style={{ marginRight: 8, color: 'var(--green)' }} />
              +91 82788 17918
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              <i className="ti ti-mail" style={{ marginRight: 8, color: 'var(--green)' }} />
              rishabhgupta17618@gmail.com
            </div>
          </div>

          {info && (
            <div className="al al-s" style={{ marginBottom: 14 }}>
              <i className="ti ti-check" />{info}
            </div>
          )}

          {/* OTP Input */}
          <div className="fr">
            <label className="fl">Enter 6-Digit OTP</label>
            <input
              ref={otpRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • • • •"
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && verifyOTP()}
              style={{
                fontSize: 28, letterSpacing: 12, textAlign: 'center',
                fontFamily: 'monospace', fontWeight: 700
              }}
            />
          </div>

          {/* Timer and attempts */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 14, fontSize: 11
          }}>
            <span style={{ color: timer < 60 ? 'var(--red)' : 'var(--text3)' }}>
              {timer > 0
                ? `⏱ Expires in ${mins}:${secs}`
                : '⚠ OTP expired — click Resend'}
            </span>
            {failCount > 0 && (
              <span style={{ color: 'var(--red)', fontWeight: 500 }}>
                {3 - failCount} attempt{3 - failCount !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>

          {err && (
            <div className="al al-e" style={{ marginBottom: 14 }}>
              <i className="ti ti-alert-circle" />{err}
            </div>
          )}

          <button
            className="btn btn-p"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}
            onClick={verifyOTP}
            disabled={otp.length !== 6}
          >
            <i className="ti ti-shield-check" /> Verify OTP &amp; Login
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setStep('creds'); setOtp(''); setErr(''); setInfo('') }}>
              <i className="ti ti-arrow-left" /> Back
            </button>
            <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }}
              onClick={sendOTP} disabled={sending || timer > 540}>
              <i className={`ti ti-refresh${sending ? ' spin' : ''}`} />
              {sending ? 'Sending…' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── CREDENTIALS SCREEN ────────────────────────────────────────
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
          <input
            placeholder="e.g. 1101954232"
            value={cid}
            onChange={e => setCid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && validateAndSendOTP()}
          />
        </div>
        <div className="fr">
          <label className="fl">Dhan Access Token</label>
          <input
            type="password"
            placeholder="eyJ0eXAiOiJKV1Qi…"
            value={tok}
            onChange={e => setTok(e.target.value)}
          />
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Get from web.dhan.co → My Profile → API Access → Generate Token
          </div>
        </div>
        <div className="fr">
          <label className="fl">Google Gemini API Key</label>
          <input
            type="password"
            placeholder="AIzaSy…"
            value={gkey}
            onChange={e => setGkey(e.target.value)}
          />
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Get from aistudio.google.com/app/apikey
          </div>
        </div>

        {err && (
          <div className="al al-e" style={{ marginBottom: 14 }}>
            <i className="ti ti-alert-circle" />{err}
          </div>
        )}

        <button
          className="btn btn-p"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={validateAndSendOTP}
          disabled={loading || sending}
        >
          <i className={`ti ti-${loading || sending ? 'refresh spin' : 'lock-open'}`} />
          {loading ? 'Verifying…' : sending ? 'Sending OTP…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
