import { useCallback, useEffect, useRef, useState } from 'react'
import { duck } from '../audio/soundscape.js'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  const english = voices.filter((v) => v.lang?.toLowerCase().startsWith('en'))
  return (
    english.find((v) => /google uk english female|natural|neural/i.test(v.name)) ||
    english.find((v) => v.lang === 'en-GB') ||
    english.find((v) => v.lang === 'en-IN') ||
    english[0] ||
    null
  )
}

function sentences(text) {
  return text.match(/[^.!?]+[.!?]*\s*/g)?.map((s) => s.trim()).filter(Boolean) || [text]
}

export function useNarrator() {
  const [speaking, setSpeaking] = useState(false)
  const token = useRef(0)
  const utterances = useRef([])
  const watcher = useRef(null)

  const clearWatcher = () => {
    clearInterval(watcher.current)
    watcher.current = null
  }

  const stop = useCallback(() => {
    if (!supported) return
    token.current += 1
    clearWatcher()
    window.speechSynthesis.cancel()
    utterances.current = []
    setSpeaking(false)
    duck(false)
  }, [])

  const speak = useCallback((text, onDone) => {
    if (!supported || !text) return
    token.current += 1
    const mine = token.current
    clearWatcher()
    window.speechSynthesis.cancel()

    let finished = false
    const finish = (completed) => {
      if (finished || token.current !== mine) return
      finished = true
      clearWatcher()
      utterances.current = []
      setSpeaking(false)
      duck(false)
      if (completed) onDone?.()
    }

    const voice = pickVoice()
    const parts = sentences(text).map((part, i, all) => {
      const u = new SpeechSynthesisUtterance(part)
      if (voice) u.voice = voice
      u.rate = 0.95
      if (i === all.length - 1) u.onend = () => finish(true)
      u.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') finish(false)
      }
      return u
    })
    utterances.current = parts
    setSpeaking(true)
    duck(true)
    parts.forEach((u) => window.speechSynthesis.speak(u))

    let quietChecks = 0
    watcher.current = setInterval(() => {
      const busy = window.speechSynthesis.speaking || window.speechSynthesis.pending
      quietChecks = busy ? 0 : quietChecks + 1
      if (quietChecks >= 3) finish(true)
    }, 300)
  }, [])

  useEffect(
    () => () => {
      clearInterval(watcher.current)
      if (supported) window.speechSynthesis.cancel()
      duck(false)
    },
    [],
  )

  return { supported, speaking, speak, stop }
}