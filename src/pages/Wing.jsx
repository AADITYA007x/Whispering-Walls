import { Link, useParams } from 'react-router'
import Doorway from '../components/Doorway.jsx'
import NotFound from './NotFound.jsx'
import { ENTRANCE, findWing } from '../data/museum.js'
import { useWall } from '../hooks/useWall.js'

export default function Wing() {
  const { wingId } = useParams()
  const wing = findWing(wingId)
  useWall(wing?.wall ?? ENTRANCE.wall, wing?.text ?? ENTRANCE.text)

  if (!wing) return <NotFound />

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <nav aria-label="Breadcrumb" className="text-sm opacity-75">
        <Link to="/" className="hover:underline">
          Entrance hall
        </Link>
        <span className="mx-2">/</span>
        <span aria-current="page">{wing.name}</span>
      </nav>
      <h1 className="mt-6 font-display text-5xl md:text-7xl">{wing.name}</h1>
      <p className="mt-4 max-w-[50ch] text-lg opacity-90">{wing.blurb}</p>

      <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-10">
        {wing.rooms.map((room) => (
          <Doorway
            key={room.id}
            to={`/wing/${wing.id}/room/${room.id}`}
            wall="rgba(0,0,0,0.28)"
            text={wing.text}
            title={room.name}
            subtitle={room.subtitle}
            tall={false}
          />
        ))}
      </div>
    </div>
  )
}
