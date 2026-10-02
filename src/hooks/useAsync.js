import { useEffect, useState } from 'react'

export function useAsync(task, deps) {
  const [state, setState] = useState({ status: 'loading', data: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setState({ status: 'loading', data: null })
    task()
      .then((data) => active && setState({ status: 'done', data }))
      .catch((error) => active && setState({ status: 'error', data: null, error }))
    return () => {
      active = false
    }
  }, [...deps, attempt])

  return { ...state, retry: () => setAttempt((n) => n + 1) }
}
