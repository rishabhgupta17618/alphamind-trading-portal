/**
 * Groq AI — direct browser calls (Groq supports CORS natively)
 * 100% free: 14,400 requests/day, no credit card needed.
 * Get your key at console.groq.com → API Keys
 * No server proxy needed — calls go browser → Groq directly.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
]

async function callGroq(apiKey, prompt, maxTokens = 2000, modelIdx = 0) {
  if (modelIdx >= MODELS.length) throw new Error('All Groq models unavailable. Please try again.')

  const model = MODELS[modelIdx]
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `HTTP ${res.status}`
    // Retry on rate limit or service unavailable
    if (res.status === 429 || res.status === 503) {
      return callGroq(apiKey, prompt, maxTokens, modelIdx + 1)
    }
    throw new Error(msg)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content?.trim() || ''
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return { raw: clean }
  }
}

export async function groqJSON(apiKey, prompt, maxTokens = 2000) {
  return callGroq(apiKey, prompt, maxTokens)
}

export async function groqText(apiKey, prompt, maxTokens = 1000) {
  const result = await callGroq(apiKey, prompt, maxTokens)
  if (typeof result === 'string') return result
  if (result?.raw) return result.raw
  return JSON.stringify(result)
}
