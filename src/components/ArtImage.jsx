import { useState } from 'react'
import { imageSources } from '../api/collection.js'

export default function ArtImage({ painting, large = false, lazy = false, className = '' }) {
  const [attempt, setAttempt] = useState(0)
  const urls = imageSources(painting, large).filter(Boolean)

  if (attempt >= urls.length) {
    return (
      <div className={`flex items-center justify-center bg-ink/40 ${className}`} role="img" aria-label={painting.title}>
        <span className="bg-ink/70 px-3 py-1 text-xs text-ivory">Image unavailable</span>
      </div>
    )
  }

  return (
    <img
      key={urls[attempt]}
      src={urls[attempt]}
      alt={`${painting.title} by ${painting.artist}`}
      loading={lazy ? 'lazy' : 'eager'}
      onError={() => setAttempt((n) => n + 1)}
      className={className}
    />
  )
}
