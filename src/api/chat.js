const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export async function askPainting(paintingId, question, history) {
  let res
  try {
    res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ painting_id: paintingId, question, history }),
    })
  } catch {
    throw new Error("The painting can't hear you right now. Check that the museum's backend is running.")
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = typeof json.detail === 'string' ? json.detail : 'Something went wrong. Try asking again.'
    throw new Error(detail)
  }
  return json
}
