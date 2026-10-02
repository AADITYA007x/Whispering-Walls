import data from '../data/hotspots.json'

export function getHotspots(paintingId) {
  return data[paintingId] || []
}

export async function saveHotspots(paintingId, hotspots) {
  const res = await fetch('/__hotspots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paintingId, hotspots }),
  })
  if (!res.ok) throw new Error('Saving failed')
}
