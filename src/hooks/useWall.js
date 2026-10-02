import { useEffect } from 'react'

export function useWall(wall, text) {
  useEffect(() => {
    const style = document.body.style
    style.setProperty('--wall', wall)
    style.setProperty('--ink-on-wall', text)
  }, [wall, text])
}
