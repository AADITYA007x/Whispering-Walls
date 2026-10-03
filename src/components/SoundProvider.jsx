import { createContext, useContext, useEffect, useState } from 'react'
import { isSupported, setEnabled, setScene, skip, subscribe } from '../audio/soundscape.js'

const SoundContext = createContext({ supported: false, on: false, track: null, toggle() {}, next() {} })

export function SoundProvider({ children }) {
  const [on, setOn] = useState(false)
  const [track, setTrack] = useState(null)
  const supported = isSupported()

  useEffect(() => subscribe(setTrack), [])

  function toggle() {
    const next = !on
    setOn(next)
    setEnabled(next)
  }

  return <SoundContext.Provider value={{ supported, on, track, toggle, next: skip }}>{children}</SoundContext.Provider>
}

export function useSoundToggle() {
  return useContext(SoundContext)
}

export function useScene(name) {
  useEffect(() => {
    setScene(name)
  }, [name])
}
