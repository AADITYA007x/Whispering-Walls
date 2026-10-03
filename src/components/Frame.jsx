import { Link } from 'react-router'
import ArtImage from './ArtImage.jsx'
import DetailsBadge from './DetailsBadge.jsx'
import { byline } from '../api/collection.js'
import { hotspotCount } from '../api/hotspots.js'

export default function Frame({ painting, height }) {
  const aspect = Math.min(2, Math.max(0.5, painting.aspect || 0.8))
  const width = Math.round(height * aspect)
  const details = hotspotCount(painting.id)

  return (
    <figure className="flex shrink-0 snap-center flex-col items-center">
      <div className="relative">
      <span className="picture-lamp" aria-hidden="true" />
      <Link
        to={`/painting/${painting.id}`}
        className="gilt-frame relative block transition-transform duration-500 hover:scale-[1.02]"
        style={{ width, height }}
        aria-label={details ? `${painting.title}, ${details} hidden details` : painting.title}
      >
        <ArtImage painting={painting} lazy className="h-full w-full object-cover" />
        {details > 0 && (
          <span className="absolute -top-4 -right-4 grid h-8 w-8 place-items-center rounded-full border-2 border-ivory bg-gilt text-sm font-semibold text-ink shadow-md">
            {details}
          </span>
        )}
      </Link>
      </div>
      <figcaption className="mt-5 w-56 bg-ivory px-3 py-2 text-left text-ink shadow-sm">
        <span className="block truncate font-display text-sm font-medium">{painting.title}</span>
        <span className="block truncate text-xs text-ink/70">{byline(painting)}</span>
        <DetailsBadge count={details} className="mt-1" />
      </figcaption>
    </figure>
  )
}
