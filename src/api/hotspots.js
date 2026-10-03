import yours from '../data/hotspots.json'
import curated from '../data/curated-hotspots.json'
import byTitle from '../data/curated-by-title.json'
import collection from '../data/paintings.json'

function normalize(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function titleKey(painting) {
  if (!painting) return ''
  const words = normalize(painting.artist).split(' ')
  const surname = words.slice(-1)[0] || ''
  const lastTwo = words.slice(-2).join(' ')
  const title = normalize(painting.title)
  return [`${title}|${lastTwo}`, `${title}|${surname}`]
}

function fromTitle(paintingId) {
  const keys = titleKey(collection.paintings[paintingId])
  for (const key of keys || []) if (byTitle[key]) return byTitle[key]
  return null
}

export function getHotspots(paintingId) {
  return yours[paintingId] || curated[paintingId] || fromTitle(paintingId) || []
}

export function hotspotCount(paintingId) {
  return getHotspots(paintingId).length
}

export async function saveHotspots(paintingId, hotspots) {
  const res = await fetch('/__hotspots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paintingId, hotspots }),
  })
  if (!res.ok) throw new Error('Saving failed')
}
