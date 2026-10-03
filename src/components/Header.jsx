import { Link, useLocation } from 'react-router'
import { useSoundToggle } from './SoundProvider.jsx'
import { usePostcards } from '../hooks/usePostcards.js'

function SpeakerIcon({ on }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {on ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" /> : <path d="M16 9l5 6M21 9l-5 6" />}
    </svg>
  )
}

export default function Header() {
  const { pathname } = useLocation()
  const sound = useSoundToggle()
  const { cards } = usePostcards()

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-5 md:px-8">
      <Link to="/" className="mr-auto font-display text-lg font-medium">
        Whispering Walls
      </Link>
      {pathname !== '/' && (
        <Link to="/" className="text-sm opacity-80 transition-opacity hover:opacity-100">
          Entrance hall
        </Link>
      )}
      <Link to="/postcards" className="text-sm opacity-80 transition-opacity hover:opacity-100">
        My postcards{cards.length > 0 ? ` (${cards.length})` : ''}
      </Link>
      {sound.supported && (
        <button
          type="button"
          onClick={sound.toggle}
          aria-pressed={sound.on}
          className="inline-flex items-center gap-2 text-sm opacity-80 transition-opacity hover:opacity-100"
        >
          <SpeakerIcon on={sound.on} />
          {sound.on ? 'Music on' : 'Music off'}
        </button>
      )}
      {sound.on && (
        <p className="w-full text-right text-xs opacity-70" aria-live="polite">
          {sound.track ? (
            <>
              {sound.track.page ? (
                <>
                  Now playing:{' '}
                  <a href={sound.track.page} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    {sound.track.name}
                  </a>
                </>
              ) : (
                sound.track.name
              )}
              {' '}
              <button type="button" onClick={sound.next} className="ml-2 underline underline-offset-2">
                Next piece
              </button>
            </>
          ) : (
            'Finding music for this room…'
          )}
        </p>
      )}
    </header>
  )
}
