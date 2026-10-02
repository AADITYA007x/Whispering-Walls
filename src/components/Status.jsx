export function Loading({ message }) {
  return <p className="py-24 text-center font-display text-xl italic opacity-80">{message}</p>
}

export function LoadError({ message, onRetry }) {
  return (
    <div className="py-24 text-center">
      <p className="mx-auto max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 border border-current px-5 py-2 text-sm transition-opacity hover:opacity-80"
        >
          Try again
        </button>
      )}
    </div>
  )
}
