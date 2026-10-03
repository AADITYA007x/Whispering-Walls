import data from '../data/paintings.json'
import { hotspotCount } from './hotspots.js'
import { HIDDEN_PAINTINGS } from '../data/museum.js'

const hidden = new Set(HIDDEN_PAINTINGS)
const all = Object.values(data.paintings).filter((p) => !hidden.has(p.id))

export function hasCollection() {
  return all.length > 0
}

export function getRoomPaintings(key) {
  return (data.rooms[key] || []).filter((id) => !hidden.has(id)).map((id) => data.paintings[id]).filter(Boolean)
}

export function getPainting(id) {
  return hidden.has(id) ? null : data.paintings[id] || null
}

function showcase() {
  const best = all.filter((p) => p.story && hotspotCount(p.id) > 0).sort((a, b) => b.fame - a.fame)
  if (best.length) return best
  return [...all].sort((a, b) => b.fame - a.fame).slice(0, 60)
}

export function getPaintingOfTheDay() {
  const pool = showcase()
  if (!pool.length) return null
  const now = new Date()
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000)
  return pool[day % pool.length]
}

export function getRandomPainting(exceptId) {
  const pool = showcase().filter((p) => p.id !== exceptId)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
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

export function zoomSources(painting) {
  const large = painting.imageLarge
  return [large?.replace('/1920px-', '/3840px-'), large, painting.image].filter(Boolean)
}

export function totalPaintings() {
  return all.length
}

function byFame(ids) {
  return ids
    .filter((id) => !hidden.has(id))
    .map((id) => data.paintings[id])
    .filter(Boolean)
    .sort((a, b) => b.fame - a.fame)
}

export function wingPreviews(wings) {
  const used = new Set()
  const result = {}
  for (const wing of wings) {
    const ids = wing.rooms.flatMap((r) => data.rooms[`${wing.id}/${r.id}`] || [])
    const pick = byFame(ids).find((p) => !used.has(p.id)) || null
    if (pick) used.add(pick.id)
    result[wing.id] = pick
  }
  return result
}

export function roomPreviews(wing) {
  const used = new Set()
  const result = {}
  for (const room of wing.rooms) {
    const pick = getRoomPaintings(`${wing.id}/${room.id}`).find((p) => !used.has(p.id)) || null
    if (pick) used.add(pick.id)
    result[room.id] = pick
  }
  return result
}

export function mostFamous(filter, limit) {
  return all.filter(filter).sort((a, b) => b.fame - a.fame).slice(0, limit)
}
