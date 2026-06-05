/**
 * Groq AI — All calls go through /api/groq (server-side proxy)
 * 100% free: 14,400 requests/day, no credit card needed.
 * Get your key at console.groq.com → API Keys
 */

const PROXY = '/api/groq'

async function callProxy(prompt, maxTokens = 2000, apiKey = '') {
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, maxTokens, apiKey }),
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error || `Groq error ${res.status}`)
  }
  return data.result  // already parsed JSON
}

export async function groqJSON(apiKey, prompt, maxTokens = 2000) {
  return callProxy(prompt, maxTokens, apiKey)
}

export async function groqText(apiKey, prompt, maxTokens = 1000) {
  const result = await callProxy(prompt, maxTokens, apiKey)
  if (typeof result === 'string') return result
  if (result?.raw) return result.raw
  return JSON.stringify(result)
}
