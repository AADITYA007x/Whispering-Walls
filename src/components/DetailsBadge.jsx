export default function DetailsBadge({ count, className = '' }) {
  if (!count) return null
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-gilt-deep ${className}`}>
      <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
        <circle cx="6" cy="6" r="5" fill="currentColor" />
        <circle cx="6" cy="6" r="2" fill="#f2ede3" />
      </svg>
      {count} hidden {count === 1 ? 'detail' : 'details'}
    </span>
  )
}
