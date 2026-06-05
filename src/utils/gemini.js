/**
 * Gemini AI — All calls go through /api/gemini (server-side proxy)
 * Proxy handles model fallback: gemini-1.5-flash → gemini-1.5-flash-8b → gemini-2.0-flash-lite
 * This avoids per-model rate limits by trying multiple models.
 */

const PROXY = '/api/gemini'

async function callProxy(prompt, maxTokens = 2000, apiKey = '') {
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxTokens, apiKey }),
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error || `Gemini error ${res.status}`)
  }
  return data.result  // already parsed JSON
}

export async function geminiJSON(apiKey, prompt, maxTokens = 2000) {
  return callProxy(prompt, maxTokens, apiKey)
}

export async function geminiText(apiKey, prompt, maxTokens = 1000) {
  const result = await callProxy(prompt, maxTokens, apiKey)
  if (typeof result === 'string') return result
  if (result?.raw) return result.raw
  return JSON.stringify(result)
}
