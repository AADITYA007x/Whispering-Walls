import data from '../data/paintings.json'

const all = Object.values(data.paintings)

export function hasCollection() {
  return all.length > 0
}

export function getRoomPaintings(key) {
  return (data.rooms[key] || []).map((id) => data.paintings[id]).filter(Boolean)
}

export function getPainting(id) {
  return data.paintings[id] || null
}

export function getPaintingOfTheDay() {
  if (!all.length) return null
  const famous = [...all].sort((a, b) => b.fame - a.fame).slice(0, 60)
  const day = Math.floor(Date.now() / 86400000)
  return famous[day % famous.length]
}

export function getRandomPainting() {
  if (!all.length) return null
  return all[Math.floor(Math.random() * all.length)]
}

export function imageSources(painting, large = false) {
  const original = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(painting.file)}`
  const sized = (w) => `${original}?width=${w}`
  return large
    ? [painting.imageLarge, painting.image, sized(1280), original]
    : [painting.image, sized(500), original]
}

export function byline(painting) {
  return [painting.artist, painting.year].filter(Boolean).join(', ')
}
