import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Doorway from '../components/Doorway.jsx'
import ArtImage from '../components/ArtImage.jsx'
import Frame from '../components/Frame.jsx'
import EmptyCollection from '../components/EmptyCollection.jsx'
import DetailsBadge from '../components/DetailsBadge.jsx'
import { ENTRANCE, SURPRISE, WINGS } from '../data/museum.js'
import {
  byline,
  getPaintingOfTheDay,
  getRandomPainting,
  hasCollection,
  mostFamous,
  totalPaintings,
  wingPreview,
} from '../api/collection.js'
import { hotspotCount } from '../api/hotspots.js'
import { useWall } from '../hooks/useWall.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

const roomCount = WINGS.reduce((n, w) => n + w.rooms.length, 0)

export default function Entrance() {
  useWall(ENTRANCE.wall, ENTRANCE.text)
  const navigate = useNavigate()
  const isSmall = useMediaQuery('(max-width: 767px)')
  const featured = getPaintingOfTheDay()
  const whispering = mostFamous((p) => hotspotCount(p.id) > 0, 14)
  const total = totalPaintings()
  const withDetails = mostFamous((p) => hotspotCount(p.id) > 0, 10000).length
  const [mysteryPainting] = useState(() => getRandomPainting(featured?.id))

  function surprise() {
    const painting = getRandomPainting(featured?.id)
    if (painting) navigate(`/painting/${painting.id}`)
  }

  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pt-6 pb-12 text-center md:px-8 md:pt-10">
        <h1 className="font-display text-6xl font-semibold leading-[0.95] tracking-tight md:text-[8.5rem]">
          Whispering
          <br />
          Walls
        </h1>
        <p className="mx-auto mt-7 max-w-[40ch] text-lg leading-relaxed md:text-xl">
          A museum where paintings tell their own stories. Peek through a doorway and wander in.
        </p>
        {total > 0 && (
          <p className="mt-3 text-sm opacity-65">
            {total} paintings in {roomCount} rooms, {withDetails} with hidden details to uncover
          </p>
        )}
      </section>

      <nav aria-label="Museum wings" className="mx-auto grid max-w-6xl grid-cols-2 gap-x-5 gap-y-12 px-5 md:grid-cols-4 md:gap-8 md:px-8">
        {WINGS.map((wing, i) => {
          const preview = wingPreview(wing)
          return (
            <Doorway
              key={wing.id}
              index={i}
              to={`/wing/${wing.id}`}
              wall={wing.wall}
              title={wing.name}
              subtitle={wing.blurb}
              painting={preview}
              note={preview ? `Through this door: ${preview.title}` : null}
            />
          )
        })}
        <Doorway
          index={WINGS.length}
          onClick={surprise}
          disabled={!hasCollection()}
          wall={SURPRISE.wall}
          title="Surprise me"
          subtitle="Step in front of a random painting"
          painting={mysteryPainting}
          note="No peeking"
          mystery
        />
      </nav>

      {whispering.length > 0 && (
        <section className="mt-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="font-display text-3xl font-medium md:text-4xl">Paintings with hidden details</h2>
            <p className="mt-2 max-w-[56ch] opacity-75">
              Tap the glowing markers on these paintings to uncover the secrets tucked into their corners.
            </p>
          </div>
          <div className="no-scrollbar mt-4 flex snap-x items-end gap-14 overflow-x-auto px-[6vw] pt-16 pb-4">
            {whispering.map((painting) => (
              <Frame key={painting.id} painting={painting} height={isSmall ? 190 : 240} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-24 max-w-6xl px-5 md:px-8">
        <h2 className="font-display text-3xl font-medium md:text-4xl">Painting of the day</h2>
        {!featured && <EmptyCollection />}
        {featured && (
          <div className="mt-10 grid items-center gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <Link to={`/painting/${featured.id}`} className="relative mx-auto block w-fit pt-6">
              <span className="picture-lamp" aria-hidden="true" style={{ top: '-4px' }} />
              <span className="gilt-frame block w-fit">
                <ArtImage painting={featured} large className="block max-h-[28rem] min-h-48 w-auto min-w-48" />
              </span>
            </Link>
            <div>
              <p className="font-display text-4xl font-medium leading-tight md:text-5xl">{featured.title}</p>
              <p className="mt-3 text-lg opacity-80">{byline(featured)}</p>
              <DetailsBadge count={hotspotCount(featured.id)} className="mt-3" />
              {featured.story && (
                <p className="mt-5 line-clamp-4 max-w-[58ch] font-display text-lg leading-relaxed opacity-90">{featured.story}</p>
              )}
              <Link
                to={`/painting/${featured.id}`}
                className="mt-7 inline-block bg-ink px-6 py-3 text-sm text-ivory transition-colors hover:bg-gilt-deep"
              >
                Go see it
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
