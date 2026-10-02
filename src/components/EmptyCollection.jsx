export default function EmptyCollection() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <p className="font-display text-2xl">The walls are still bare</p>
      <p className="mt-3 opacity-80">
        Run <code className="bg-black/15 px-1.5 py-0.5">npm run collect</code> in your terminal to gather the paintings,
        then refresh this page.
      </p>
    </div>
  )
}
