import { useNavigate, useParams } from 'react-router'
import ArtImage from '../components/ArtImage.jsx'
import NotFound from './NotFound.jsx'
import { VIEWING_ROOM } from '../data/museum.js'
import { getPainting } from '../api/collection.js'
import { useWall } from '../hooks/useWall.js'

function Detail({ label, value }) {
  if (!value) return null
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-t border-ivory/15 py-2.5 text-sm">
      <dt className="opacity-60">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export default function Painting() {
  const { id } = useParams()
  const navigate = useNavigate()
  const painting = getPainting(id)
  useWall(VIEWING_ROOM.wall, VIEWING_ROOM.text)

  if (!painting) return <NotFound />

  function goBack() {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <button type="button" onClick={goBack} className="text-sm opacity-80 hover:underline">
        Back to the room
      </button>

      <article className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="picture-light flex items-start justify-center pt-10 pb-6">
          <div className="gilt-frame w-fit">
            <ArtImage painting={painting} large className="block max-h-[72vh] min-h-64 w-auto min-w-64 max-w-full" />
          </div>
        </div>

        <div className="pb-6 lg:pt-10">
          <h1 className="font-display text-4xl italic leading-tight md:text-5xl">{painting.title}</h1>
          <p className="mt-4 text-lg opacity-85">{painting.artist}</p>

          <dl className="mt-8">
            <Detail label="Painted" value={painting.year} />
            <Detail label="Held at" value={painting.collection} />
          </dl>

          {painting.story && (
            <p className="mt-10 max-w-[62ch] font-display text-lg leading-relaxed">{painting.story}</p>
          )}

          <a
            href={painting.wikipedia}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-block text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
          >
            Read the full story on Wikipedia
          </a>
        </div>
      </article>
    </div>
  )
}
