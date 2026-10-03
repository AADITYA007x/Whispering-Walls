import { Link } from 'react-router'
import ArtImage from './ArtImage.jsx'

export default function Doorway({ to, onClick, wall, title, subtitle, painting, note, index = 0, tall = true, mystery = false, disabled = false }) {
  const content = (
    <>
      <span
        className={`doorway-arch relative block w-full overflow-hidden rounded-t-full ${tall ? 'h-64 md:h-96' : 'h-52 md:h-64'}`}
        style={{ background: wall, '--door-delay': `${0.25 + index * 0.18}s` }}
      >
        {painting && (
          <ArtImage
            painting={painting}
            lazy
            className={`doorway-painting absolute inset-0 h-full w-full object-cover ${mystery ? 'blur-xl scale-125' : ''}`}
          />
        )}
        <span className="doorway-tint absolute inset-0" style={{ background: wall }} />
        <span className="doorway-light absolute inset-0" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute inset-x-4 bottom-6 font-display text-xl font-medium leading-tight text-ivory md:text-2xl">
          {title}
        </span>
      </span>
      <span className="mt-4 block max-w-[26ch] text-sm leading-snug opacity-85">{subtitle}</span>
      {note && <span className="mt-1.5 block max-w-[26ch] text-xs opacity-60">{note}</span>}
    </>
  )

  const className = 'doorway group flex flex-col items-center text-center disabled:cursor-wait'

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  )
}
