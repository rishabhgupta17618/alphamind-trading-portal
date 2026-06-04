// OTP system — generates and validates one-time passwords
// OTP is generated client-side and shown to user (simulated SMS/email)
// In production this would call a backend to send real SMS/email

import { lsGet, lsSet, KEYS } from './storage.js'

const OTP_VALID_MS = 10 * 60 * 1000   // 10 minutes
const MAX_FAILS    = 3
const LOCK_MS      = 24 * 60 * 60 * 1000 // 24 hours

export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000)) // 6-digit
}

export function isLockedOut() {
  const lock = lsGet(KEYS.OTP_LOCK)
  if (!lock) return false
  if (Date.now() < lock.until) return { locked: true, remaining: lock.until - Date.now() }
  lsSet(KEYS.OTP_LOCK, null)
  lsSet(KEYS.OTP_FAIL, 0)
  return false
}

export function getFailCount() {
  return lsGet(KEYS.OTP_FAIL) || 0
}

export function recordFail() {
  const fails = getFailCount() + 1
  lsSet(KEYS.OTP_FAIL, fails)
  if (fails >= MAX_FAILS) {
    lsSet(KEYS.OTP_LOCK, { until: Date.now() + LOCK_MS, reason: 'Too many incorrect OTP attempts' })
    return { locked: true }
  }
  return { locked: false, remaining: MAX_FAILS - fails }
}

export function resetFails() {
  lsSet(KEYS.OTP_FAIL, 0)
  lsSet(KEYS.OTP_LOCK, null)
}

export function formatLockRemaining(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
