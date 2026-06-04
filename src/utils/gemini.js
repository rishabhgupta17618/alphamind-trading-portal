// Google Gemini Free API — 1,500 requests/day
export async function geminiJSON(apiKey, prompt, maxTokens = 2000) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3, responseMimeType: 'application/json' }
    })
  })
  if (!res.ok) {
    const e = await res.json()
    throw new Error(e.error?.message || `Gemini error ${res.status}`)
  }
  const d = await res.json()
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(clean) } catch { return { raw: clean } }
}

export async function geminiText(apiKey, prompt, maxTokens = 1000) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 }
    })
  })
  if (!res.ok) throw new Error(`Gemini error ${res.status}`)
  const d = await res.json()
  return d.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
