import { Link } from 'react-router'

export default function Doorway({ to, onClick, wall, text, title, subtitle, tall = true, disabled = false }) {
  const arch = (
    <span
      className={`relative block w-full overflow-hidden rounded-t-full shadow-[inset_0_-14px_0_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:-translate-y-1.5 ${
        tall ? 'h-56 md:h-80' : 'h-44 md:h-56'
      }`}
      style={{ background: wall, color: text }}
    >
      <span className="picture-light absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      <span className="absolute inset-x-4 bottom-7 font-display text-xl leading-tight md:text-2xl">{title}</span>
    </span>
  )

  const content = (
    <>
      {arch}
      {subtitle && <span className="mt-3 block max-w-[24ch] text-sm leading-snug opacity-80">{subtitle}</span>}
    </>
  )

  const className = 'group flex flex-col items-center text-center disabled:cursor-wait'

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
