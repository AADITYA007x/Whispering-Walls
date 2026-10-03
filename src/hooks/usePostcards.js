import { useEffect, useState } from 'react'

const KEY = 'whispering-walls-postcards'
const EVENT = 'postcards-change'

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT))
}

export function usePostcards() {
  const [cards, setCards] = useState(read)

  useEffect(() => {
    const sync = () => setCards(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const isSaved = (id) => cards.some((c) => c.id === id)

  function toggle(id) {
    const list = read()
    write(list.some((c) => c.id === id) ? list.filter((c) => c.id !== id) : [{ id, savedAt: new Date().toISOString(), note: '' }, ...list])
  }

  function setNote(id, note) {
    write(read().map((c) => (c.id === id ? { ...c, note } : c)))
  }

  function remove(id) {
    write(read().filter((c) => c.id !== id))
  }

  return { cards, isSaved, toggle, setNote, remove }
}
