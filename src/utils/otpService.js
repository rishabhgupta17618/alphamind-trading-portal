/**
 * OTP Service — calls /api/otp serverless function
 * Which sends real email (Gmail SMTP) + SMS (Fast2SMS)
 */

const PROXY = '/api/otp'

export async function sendOTPviaServer(otp) {
  try {
    const res = await fetch(PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', otp }),
    })
    const data = await res.json()
    return {
      success: data.success,
      email:   data.email,
      sms:     data.sms,
      error:   data.error,
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
