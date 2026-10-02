import { Link } from 'react-router'
import { ENTRANCE } from '../data/museum.js'
import { useWall } from '../hooks/useWall.js'

export default function NotFound() {
  useWall(ENTRANCE.wall, ENTRANCE.text)

  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-5xl">This room doesn't exist</h1>
      <p className="mt-4 text-lg opacity-80">The door you tried leads nowhere. Head back and pick another one.</p>
      <Link to="/" className="mt-8 inline-block border border-current px-5 py-2 text-sm">
        Go to the entrance hall
      </Link>
    </div>
  )
}
