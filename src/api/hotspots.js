import yours from '../data/hotspots.json'
import curated from '../data/curated-hotspots.json'

export function getHotspots(paintingId) {
  return yours[paintingId] || curated[paintingId] || []
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
