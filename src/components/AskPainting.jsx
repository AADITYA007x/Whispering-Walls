import { useEffect, useRef, useState } from 'react'
import { askPainting } from '../api/chat.js'

const SUGGESTIONS = ['Who made you, and why?', 'What should I notice first?', 'Where have you been since you were painted?']

export default function AskPainting({ painting }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
  const logRef = useRef(null)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  async function send(text) {
    const q = text.trim()
    if (!q) return setError('Type a question first.')
    if (q.length > 400) return setError('Keep your question under 400 characters.')
    if (thinking) return
    setError('')
    setQuestion('')
    const history = messages.map((m) => ({ role: m.role, text: m.text }))
    setMessages((m) => [...m, { role: 'visitor', text: q }])
    setThinking(true)
    try {
      const reply = await askPainting(painting.id, q, history)
      setMessages((m) => [...m, { role: 'painting', text: reply.answer, sources: reply.sources }])
    } catch (err) {
      setError(err.message)
      setMessages((m) => m.slice(0, -1))
      setQuestion(q)
    } finally {
      setThinking(false)
    }
  }

  return (
    <section className="mt-12 border-t border-ivory/15 pt-8" aria-label="Ask the painting">
      <h2 className="font-display text-2xl font-medium">Ask the painting</h2>
      <p className="mt-2 text-sm opacity-75">It only shares what's recorded about it, so it may admit it doesn't know.</p>

      {messages.length > 0 && (
        <div ref={logRef} aria-live="polite" className="mt-6 max-h-96 space-y-4 overflow-y-auto pr-1">
          {messages.map((m, i) =>
            m.role === 'visitor' ? (
              <p key={i} className="ml-auto w-fit max-w-[85%] bg-ivory px-4 py-2 text-sm text-ink">
                {m.text}
              </p>
            ) : (
              <div key={i} className="max-w-[92%]">
                <p className="font-display text-lg leading-relaxed">{m.text}</p>
                {m.sources?.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs underline underline-offset-2 opacity-60 hover:opacity-90">
                    {s.label}
                  </a>
                ))}
              </div>
            ),
          )}
          {thinking && <p className="font-display text-lg opacity-60">Thinking…</p>}
        </div>
      )}

      {messages.length === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={thinking}
              className="border border-ivory/40 px-3 py-1.5 text-sm transition-colors hover:bg-ivory/10 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {messages.length === 0 && thinking && <p className="mt-4 font-display text-lg opacity-60">Thinking…</p>}

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send(question)
        }}
      >
        <label htmlFor="ask-input" className="sr-only">
          Your question
        </label>
        <input
          id="ask-input"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value)
            setError('')
          }}
          placeholder="Why is the sky so dark?"
          maxLength={400}
          className="min-w-0 flex-1 border border-ivory/30 bg-black/20 px-3 py-2"
        />
        <button type="submit" disabled={thinking} className="bg-gilt px-4 py-2 text-sm text-ink disabled:opacity-60">
          Ask
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-gilt">
          {error}
        </p>
      )}
    </section>
  )
}
