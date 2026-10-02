import { Link, useLocation } from 'react-router'

export default function Header() {
  const { pathname } = useLocation()

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
      <Link to="/" className="font-display text-lg font-medium">
        Whispering Walls
      </Link>
      {pathname !== '/' && (
        <Link to="/" className="text-sm opacity-80 transition-opacity hover:opacity-100">
          Back to the entrance hall
        </Link>
      )}
    </header>
  )
}
