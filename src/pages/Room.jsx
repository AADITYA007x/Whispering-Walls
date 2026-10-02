import { useRef } from 'react'
import { Link, useParams } from 'react-router'
import Frame from '../components/Frame.jsx'
import EmptyCollection from '../components/EmptyCollection.jsx'
import NotFound from './NotFound.jsx'
import { ENTRANCE, findRoom, roomKey } from '../data/museum.js'
import { getRoomPaintings, hasCollection } from '../api/collection.js'
import { useWall } from '../hooks/useWall.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

function Chevron({ flip }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className={flip ? 'rotate-180' : ''}>
      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function Room() {
  const { wingId, roomId } = useParams()
  const { wing, room, index } = findRoom(wingId, roomId)
  useWall(wing?.wall ?? ENTRANCE.wall, wing?.text ?? ENTRANCE.text)
  const isSmall = useMediaQuery('(max-width: 767px)')
  const wallRef = useRef(null)

  if (!room) return <NotFound />

  const previous = wing.rooms[index - 1]
  const next = wing.rooms[index + 1]
  const frameHeight = isSmall ? 230 : 340
  const paintings = getRoomPaintings(roomKey(wing.id, room.id))

  function walk(direction) {
    const el = wallRef.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <nav aria-label="Breadcrumb" className="text-sm opacity-75">
          <Link to="/" className="hover:underline">
            Entrance hall
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/wing/${wing.id}`} className="hover:underline">
            {wing.name}
          </Link>
          <span className="mx-2">/</span>
          <span aria-current="page">{room.name}</span>
        </nav>
        <h1 className="mt-6 font-display text-4xl md:text-6xl">{room.name}</h1>
        <p className="mt-3 text-lg opacity-90">{room.subtitle}</p>
      </div>

      {!hasCollection() && <EmptyCollection />}
      {hasCollection() && paintings.length === 0 && (
        <p className="mx-auto max-w-md py-24 text-center">This room is empty for now. Try the next room along the corridor.</p>
      )}
      {paintings.length > 0 && (
        <section aria-label={`Paintings in ${room.name}`} className="relative mt-8">
          <div className="picture-light pointer-events-none absolute inset-x-0 top-0 h-48" />
          <div
            ref={wallRef}
            tabIndex={0}
            className="no-scrollbar relative flex snap-x snap-mandatory items-end gap-12 overflow-x-auto px-[8vw] pt-14 pb-4 md:gap-20"
          >
            {paintings.map((painting) => (
              <Frame key={painting.id} painting={painting} height={frameHeight} />
            ))}
          </div>
          <div className="mx-auto mt-6 flex max-w-6xl items-center justify-center gap-4 px-5">
            <button
              type="button"
              onClick={() => walk(-1)}
              aria-label="Walk left along the wall"
              className="rounded-full border border-current p-3 transition-opacity hover:opacity-75"
            >
              <Chevron flip />
            </button>
            <span className="text-sm opacity-80">{paintings.length} paintings in this room</span>
            <button
              type="button"
              onClick={() => walk(1)}
              aria-label="Walk right along the wall"
              className="rounded-full border border-current p-3 transition-opacity hover:opacity-75"
            >
              <Chevron />
            </button>
          </div>
        </section>
      )}

      <div className="mx-auto mt-16 flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 md:px-8">
        <div className="min-w-40">
          {previous && (
            <Link to={`/wing/${wing.id}/room/${previous.id}`} className="block hover:underline">
              <span className="block text-xs opacity-70">Previous room</span>
              <span className="font-display text-lg">{previous.name}</span>
            </Link>
          )}
        </div>
        <nav aria-label="Rooms in this wing" className="flex gap-1.5">
          {wing.rooms.map((r) => (
            <Link
              key={r.id}
              to={`/wing/${wing.id}/room/${r.id}`}
              aria-label={r.name}
              aria-current={r.id === room.id ? 'page' : undefined}
              className={`h-3.5 w-7 border border-current transition-colors ${r.id === room.id ? 'bg-gilt border-gilt' : 'hover:bg-white/20'}`}
            />
          ))}
        </nav>
        <div className="min-w-40 text-right">
          {next && (
            <Link to={`/wing/${wing.id}/room/${next.id}`} className="block hover:underline">
              <span className="block text-xs opacity-70">Next room</span>
              <span className="font-display text-lg">{next.name}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
