const API = 'https://api.artic.edu/api/v1'
const IIIF = 'https://www.artic.edu/iiif/2'

const LIST_FIELDS = ['id', 'title', 'artist_title', 'artist_display', 'date_display', 'image_id', 'thumbnail']
const DETAIL_FIELDS = [
  ...LIST_FIELDS,
  'medium_display',
  'dimensions',
  'place_of_origin',
  'style_title',
  'artwork_type_title',
  'credit_line',
  'description',
  'short_description',
  'is_public_domain',
]

const cache = new Map()

async function getJson(url) {
  if (cache.has(url)) return cache.get(url)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
  const json = await res.json()
  cache.set(url, json)
  return json
}

function buildQuery(filters = {}) {
  const must = [{ term: { is_public_domain: true } }, { exists: { field: 'image_id' } }]
  if (filters.type) must.push({ match: { artwork_type_title: filters.type } })
  if (filters.artist) must.push({ match_phrase: { artist_title: filters.artist } })
  if (filters.place) must.push({ match: { place_of_origin: filters.place } })
  if (filters.from || filters.to) {
    must.push({ range: { date_start: { gte: filters.from ?? 0, lte: filters.to ?? 2100 } } })
  }
  return { bool: { must, should: [{ term: { is_boosted: true } }] } }
}

export async function searchArtworks(filters = {}, { limit = 18, page = 1 } = {}) {
  const params = { query: buildQuery(filters), fields: LIST_FIELDS, limit, page }
  if (filters.q) params.q = filters.q
  const url = `${API}/artworks/search?params=${encodeURIComponent(JSON.stringify(params))}`
  const json = await getJson(url)
  return json.data.filter((a) => a.image_id)
}

export async function getArtwork(id) {
  const json = await getJson(`${API}/artworks/${id}?fields=${DETAIL_FIELDS.join(',')}`)
  return json.data
}

export async function getPaintingOfTheDay() {
  const pool = await searchArtworks({ type: 'Painting' }, { limit: 60 })
  const day = Math.floor(Date.now() / 86400000)
  return pool[day % pool.length]
}

export async function getRandomPainting() {
  const page = 1 + Math.floor(Math.random() * 10)
  const pool = await searchArtworks({ type: 'Painting' }, { limit: 30, page })
  return pool[Math.floor(Math.random() * pool.length)]
}

export function imageUrl(imageId, width = 843) {
  return `${IIIF}/${imageId}/full/${width},/0/default.jpg`
}

export function aspectRatio(artwork, fallback = 0.8) {
  const t = artwork?.thumbnail
  if (!t?.width || !t?.height) return fallback
  return Math.min(2, Math.max(0.5, t.width / t.height))
}

export function htmlToParagraphs(html) {
  if (!html) return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const paragraphs = [...doc.querySelectorAll('p')].map((p) => p.textContent.trim()).filter(Boolean)
  return paragraphs.length ? paragraphs : [doc.body.textContent.trim()].filter(Boolean)
}
