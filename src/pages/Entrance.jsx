import { Link, useNavigate } from 'react-router'
import Doorway from '../components/Doorway.jsx'
import ArtImage from '../components/ArtImage.jsx'
import EmptyCollection from '../components/EmptyCollection.jsx'
import { ENTRANCE, SURPRISE, WINGS } from '../data/museum.js'
import { byline, getPaintingOfTheDay, getRandomPainting, hasCollection } from '../api/collection.js'
import { useWall } from '../hooks/useWall.js'

export default function Entrance() {
  useWall(ENTRANCE.wall, ENTRANCE.text)
  const navigate = useNavigate()
  const featured = getPaintingOfTheDay()

  function surprise() {
    const painting = getRandomPainting()
    if (painting) navigate(`/painting/${painting.id}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <section className="pt-8 pb-14 text-center md:pt-14">
        <h1 className="font-display text-5xl leading-none md:text-8xl">Whispering Walls</h1>
        <p className="mx-auto mt-6 max-w-[44ch] text-lg">
          A museum of paintings that tell their stories. Pick a door and wander in.
        </p>
      </section>

      <nav aria-label="Museum wings" className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-8">
        {WINGS.map((wing) => (
          <Doorway
            key={wing.id}
            to={`/wing/${wing.id}`}
            wall={wing.wall}
            text={wing.text}
            title={wing.name}
            subtitle={wing.blurb}
          />
        ))}
        <Doorway
          onClick={surprise}
          disabled={!hasCollection()}
          wall={SURPRISE.wall}
          text={SURPRISE.text}
          title="Surprise me"
          subtitle="Step in front of a random painting"
        />
      </nav>

      <section className="mt-24 border-t border-ink/20 pt-10">
        <h2 className="font-display text-3xl">Painting of the day</h2>
        {!featured && <EmptyCollection />}
        {featured && (
          <div className="mt-8 grid items-center gap-10 md:grid-cols-[auto_minmax(0,1fr)]">
            <Link to={`/painting/${featured.id}`} className="gilt-frame mx-auto block w-fit">
              <ArtImage painting={featured} className="block max-h-80 min-h-48 w-auto min-w-48" />
            </Link>
            <div>
              <p className="font-display text-3xl font-medium leading-tight md:text-4xl">{featured.title}</p>
              <p className="mt-3 opacity-80">{byline(featured)}</p>
              {featured.story && <p className="mt-4 line-clamp-3 max-w-[60ch] opacity-80">{featured.story}</p>}
              <Link
                to={`/painting/${featured.id}`}
                className="mt-6 inline-block border border-current px-5 py-2 text-sm transition-colors hover:bg-ink hover:text-ivory"
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
