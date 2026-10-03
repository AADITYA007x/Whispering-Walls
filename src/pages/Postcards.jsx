import { useState } from 'react'
import { Link } from 'react-router'
import ArtImage from '../components/ArtImage.jsx'
import { POSTCARD_ROOM } from '../data/museum.js'
import { byline, getPainting } from '../api/collection.js'
import { usePostcards } from '../hooks/usePostcards.js'
import { useWall } from '../hooks/useWall.js'
import { useScene } from '../components/SoundProvider.jsx'

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

function Postcard({ card, painting, onNote, onRemove }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/painting/${painting.id}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="postcard grid w-full max-w-2xl overflow-hidden bg-ivory text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Link to={`/painting/${painting.id}`} className="block h-64 bg-ink md:h-auto" aria-label={`Visit ${painting.title}`}>
        <ArtImage painting={painting} lazy className="h-full w-full object-cover" />
      </Link>
      <div className="relative flex flex-col p-5 md:border-l md:border-dashed md:border-ink/25">
        <div className="absolute top-4 right-4 flex items-start gap-2" aria-hidden="true">
          <div className="grid h-14 w-14 -rotate-12 place-items-center rounded-full border-2 border-gilt-deep/70 text-center text-[9px] leading-tight text-gilt-deep">
            Whispering
            <br />
            Walls
            <br />
            {dateFormat.format(new Date(card.savedAt))}
          </div>
          <div className="h-16 w-12 border-[3px] border-dotted border-ink/30 bg-white p-0.5">
            <ArtImage painting={painting} lazy className="h-full w-full object-cover" />
          </div>
        </div>
        <h2 className="max-w-[16ch] pr-24 font-display text-xl font-medium leading-tight">{painting.title}</h2>
        <p className="mt-1 text-sm text-ink/70">{byline(painting)}</p>
        <label className="mt-5 block flex-1">
          <span className="sr-only">Your note</span>
          <textarea
            defaultValue={card.note}
            onBlur={(e) => onNote(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="Write yourself a note…"
            className="postcard-note h-full w-full resize-none bg-transparent text-xl leading-8 text-ink placeholder:text-ink/40 focus:outline-none"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link to={`/painting/${painting.id}`} className="underline underline-offset-4">
            Visit painting
          </Link>
          <button type="button" onClick={copyLink} className="underline underline-offset-4">
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" onClick={onRemove} className="ml-auto text-ink/60 underline underline-offset-4 hover:text-ink">
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Postcards() {
  useWall(POSTCARD_ROOM.wall, POSTCARD_ROOM.text)
  useScene('gallery')
  const { cards, setNote, remove } = usePostcards()
  const items = cards.map((card) => ({ card, painting: getPainting(card.id) })).filter((i) => i.painting)

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <h1 className="font-display text-6xl font-semibold leading-none tracking-tight md:text-8xl">My postcards</h1>
      <p className="mt-5 max-w-[52ch] text-lg opacity-90">
        Paintings you saved along the way. Add a note to remember why you loved them. They stay in this browser.
      </p>

      {items.length === 0 ? (
        <div className="mt-16 max-w-xl">
          <p className="text-lg">No postcards yet. Open any painting and tap Save postcard, and it will wait for you here.</p>
          <Link to="/" className="mt-6 inline-block bg-ivory px-6 py-3 text-sm text-ink">
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="mt-14 flex flex-col items-center gap-12">
          {items.map(({ card, painting }) => (
            <Postcard
              key={card.id}
              card={card}
              painting={painting}
              onNote={(note) => setNote(card.id, note)}
              onRemove={() => remove(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
