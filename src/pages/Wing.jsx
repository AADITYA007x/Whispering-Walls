import { Link, useParams } from 'react-router'
import Doorway from '../components/Doorway.jsx'
import NotFound from './NotFound.jsx'
import { ENTRANCE, findWing, roomKey } from '../data/museum.js'
import { getRoomPaintings, roomPreviews } from '../api/collection.js'
import { hotspotCount } from '../api/hotspots.js'
import { useWall } from '../hooks/useWall.js'
import { useScene } from '../components/SoundProvider.jsx'

function roomNote(paintings) {
  if (!paintings.length) return 'Empty for now'
  const details = paintings.filter((p) => hotspotCount(p.id) > 0).length
  const base = `${paintings.length} paintings`
  return details ? `${base}, ${details} with hidden details` : base
}

export default function Wing() {
  const { wingId } = useParams()
  const wing = findWing(wingId)
  useScene('gallery')
  useWall(wing?.wall ?? ENTRANCE.wall, wing?.text ?? ENTRANCE.text)

  if (!wing) return <NotFound />
  const previews = roomPreviews(wing)

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <nav aria-label="Breadcrumb" className="text-sm opacity-75">
        <Link to="/" className="hover:underline">
          Entrance hall
        </Link>
        <span className="mx-2">/</span>
        <span aria-current="page">{wing.name}</span>
      </nav>
      <h1 className="mt-6 font-display text-6xl font-semibold leading-none tracking-tight md:text-8xl">{wing.name}</h1>
      <p className="mt-5 max-w-[50ch] text-lg opacity-90">{wing.blurb}</p>

      <div className="mt-16 flex flex-wrap justify-center gap-x-6 gap-y-14 md:gap-x-10">
        {wing.rooms.map((room, i) => (
          <div key={room.id} className="w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1.75rem)] lg:w-[calc(25%-1.875rem)]">
          <Doorway
            key={room.id}
            index={Math.min(i, 7)}
            to={`/wing/${wing.id}/room/${room.id}`}
            wall={wing.wall}
            title={room.name}
            subtitle={room.subtitle}
            painting={previews[room.id]}
            note={roomNote(getRoomPaintings(roomKey(wing.id, room.id)))}
            tall={false}
          />
          </div>
        ))}
      </div>
    </div>
  )
}
