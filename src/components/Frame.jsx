import { Link } from 'react-router'
import ArtImage from './ArtImage.jsx'
import { byline } from '../api/collection.js'

export default function Frame({ painting, height }) {
  const aspect = Math.min(2, Math.max(0.5, painting.aspect || 0.8))
  const width = Math.round(height * aspect)

  return (
    <figure className="flex shrink-0 snap-center flex-col items-center">
      <Link
        to={`/painting/${painting.id}`}
        className="gilt-frame block transition-transform duration-500 hover:scale-[1.02]"
        style={{ width, height }}
      >
        <ArtImage painting={painting} lazy className="h-full w-full object-cover" />
      </Link>
      <figcaption className="mt-5 w-56 bg-ivory px-3 py-2 text-left text-ink shadow-sm">
        <span className="block truncate font-display text-sm italic">{painting.title}</span>
        <span className="block truncate text-xs text-ink/70">{byline(painting)}</span>
      </figcaption>
    </figure>
  )
}
