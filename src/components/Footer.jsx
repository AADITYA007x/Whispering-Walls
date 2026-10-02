export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-5 pt-16 pb-8 text-xs leading-relaxed opacity-70 md:px-8">
      Images from{' '}
      <a href="https://commons.wikimedia.org" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        Wikimedia Commons
      </a>
      . Painting details from{' '}
      <a href="https://www.wikidata.org" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        Wikidata
      </a>
      . Stories from{' '}
      <a href="https://en.wikipedia.org" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        Wikipedia
      </a>
      , shared under{' '}
      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        CC BY-SA 4.0
      </a>
      .
    </footer>
  )
}
