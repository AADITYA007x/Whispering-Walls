import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { WINGS, roomKey } from '../src/data/museum.js'

const PER_ROOM = Number(process.env.PER_ROOM || 16)
const OUTPUT = new URL('../src/data/paintings.json', import.meta.url)
const USER_AGENT = 'WhisperingWalls/1.0 (student museum project; https://github.com)'
const SPARQL = 'https://query.wikidata.org/sparql'
const SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const PAINTING = 'wd:Q3305213'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const literals = (list) => list.map((v) => `"${v.replace(/"/g, '\\"')}"@en`).join(' ')

async function request(url, options = {}, tries = 4) {
  let reason = 'unknown error'
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...options.headers },
        signal: AbortSignal.timeout(75000),
      })
      if (res.status === 404) return null
      if (res.ok) return res.json()
      reason = res.status === 429 ? 'too many requests, Wikidata asked us to slow down' : res.status >= 500 ? `server busy or query too slow (HTTP ${res.status})` : `HTTP ${res.status}`
      if (res.status !== 429 && res.status < 500) break
    } catch (error) {
      reason = error.name === 'TimeoutError' ? 'query took too long' : `network problem (${error.message})`
    }
    if (i < tries) await sleep(5000 * i)
  }
  throw new Error(reason)
}

function buildQuery(f) {
  const parts = []
  if (f.painting) parts.push(`?item wdt:P31 ${PAINTING} .`)
  if (f.types) parts.push(`VALUES ?typeName { ${literals(f.types)} } ?type rdfs:label ?typeName . ?item wdt:P31 ?type .`)

  const groups = []
  if (f.artists) groups.push(`VALUES ?artistName { ${literals(f.artists)} } ?artist rdfs:label ?artistName . ?item wdt:P170 ?artist .`)
  if (f.movements) groups.push(`VALUES ?movementName { ${literals(f.movements)} } ?movement rdfs:label ?movementName . ?item wdt:P135 ?movement .`)
  if (f.genres) groups.push(`VALUES ?genreName { ${literals(f.genres)} } ?genre rdfs:label ?genreName . ?item wdt:P136 ?genre .`)
  if (f.countries) groups.push(`VALUES ?countryName { ${literals(f.countries)} } ?country rdfs:label ?countryName . ?item wdt:P495 ?country ; wdt:P31 ${PAINTING} .`)

  if (f.matchAny && groups.length > 1) parts.push(groups.map((g) => `{ ${g} }`).join(' UNION '))
  else parts.push(...groups)

  const dated = f.from !== undefined || f.to !== undefined
  const from = f.from ?? -10000
  const to = f.to ?? 1920
  const dateLines = dated
    ? `?item wdt:P571 ?inception .
  BIND(YEAR(?inception) AS ?year)
  FILTER(?year >= ${from} && ?year <= ${to})`
    : `OPTIONAL { ?item wdt:P571 ?inception . }
  BIND(YEAR(?inception) AS ?year)
  FILTER(!BOUND(?year) || ?year <= ${to})`
  const limit = f.perArtist ? PER_ROOM * 8 : PER_ROOM * 4

  return `
SELECT ?item ?itemLabel ?creatorLabel ?image ?year ?article ?links ?collectionLabel WHERE {
  ${parts.join('\n  ')}
  FILTER NOT EXISTS { ?item wdt:P31 wd:Q5 }
  ?item wdt:P18 ?image .
  ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> .
  ?item wikibase:sitelinks ?links .
  ${dateLines}
  OPTIONAL { ?item wdt:P170 ?creator . }
  OPTIONAL { ?item wdt:P195 ?collection . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?links)
LIMIT ${limit}`
}

function commonsFile(imageUrl) {
  return decodeURIComponent(imageUrl.split('/Special:FilePath/')[1]).replace(/ /g, '_')
}

function thumbUrl(file, width) {
  const hash = createHash('md5').update(file).digest('hex')
  const name = encodeURIComponent(file)
  const suffix = /\.(tiff?|pdf)$/i.test(file) ? `${name}.jpg` : name
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash[0]}/${hash.slice(0, 2)}/${name}/${width}px-${suffix}`
}

async function collectRoom(filters) {
  const url = `${SPARQL}?format=json&query=${encodeURIComponent(buildQuery(filters))}`
  const json = await request(url, { headers: { Accept: 'application/sparql-results+json' } })
  const seen = new Map()
  const perArtist = new Map()
  for (const row of json.results.bindings) {
    const id = row.item.value.split('/').pop()
    if (seen.has(id)) continue
    const creator = row.creatorLabel?.value || 'unknown'
    if (filters.perArtist && (perArtist.get(creator) || 0) >= filters.perArtist) continue
    perArtist.set(creator, (perArtist.get(creator) || 0) + 1)
    if (/^Q\d+$/.test(row.itemLabel?.value || '')) continue
    seen.set(id, {
      id,
      title: row.itemLabel.value,
      artist: row.creatorLabel?.value && !/^(Q\d+|https?:)/.test(row.creatorLabel.value) ? row.creatorLabel.value : 'Unknown artist',
      year: row.year?.value ? Number(row.year.value) : null,
      collection: row.collectionLabel?.value && !/^(Q\d+|https?:)/.test(row.collectionLabel.value) ? row.collectionLabel.value : null,
      file: commonsFile(row.image.value),
      article: decodeURIComponent(row.article.value.split('/wiki/')[1]),
      fame: Number(row.links.value),
    })
    if (seen.size >= PER_ROOM) break
  }
  return [...seen.values()]
}

async function addStory(painting) {
  const json = await request(SUMMARY + encodeURIComponent(painting.article)).catch(() => null)
  const original = json?.originalimage
  return {
    ...painting,
    image: thumbUrl(painting.file, 960),
    imageLarge: thumbUrl(painting.file, 1920),
    aspect: original?.width && original?.height ? Number((original.width / original.height).toFixed(3)) : 0.8,
    story: json?.extract || '',
    wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(painting.article)}`,
  }
}

async function loadExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT, 'utf8'))
  } catch {
    return { rooms: {}, paintings: {} }
  }
}

async function main() {
  const only = process.argv.slice(2)
  const existing = only.length ? await loadExisting() : { rooms: {}, paintings: {} }
  const rooms = { ...existing.rooms }
  const paintings = { ...existing.paintings }
  const fresh = []
  const problems = []

  const targets = WINGS.flatMap((wing) => wing.rooms.map((room) => ({ key: roomKey(wing.id, room.id), room })))
  const selected = only.length ? targets.filter((t) => only.includes(t.key)) : targets

  if (only.length && selected.length !== only.length) {
    const known = new Set(targets.map((t) => t.key))
    console.log(`Unknown room names: ${only.filter((k) => !known.has(k)).join(', ')}`)
    console.log(`Valid names look like: ${targets[0].key}`)
    process.exit(1)
  }

  for (const { key, room } of selected) {
    process.stdout.write(`Collecting ${key.padEnd(32)}`)
    try {
      const found = await collectRoom(room.filters)
      rooms[key] = found.map((p) => p.id)
      for (const p of found) {
        if (!paintings[p.id]?.story) {
          paintings[p.id] = p
          fresh.push(p.id)
        }
      }
      console.log(`${found.length} paintings`)
      if (found.length === 0) problems.push(`${key}: no paintings found`)
    } catch (error) {
      rooms[key] ??= []
      console.log(`FAILED (${error.message})`)
      problems.push(`${key}: ${error.message}`)
    }
    await sleep(1500)
  }

  console.log(`\nFetching stories for ${fresh.length} new paintings...`)
  for (let i = 0; i < fresh.length; i += 4) {
    const batch = fresh.slice(i, i + 4)
    const done = await Promise.all(batch.map((id) => addStory(paintings[id])))
    done.forEach((p) => (paintings[p.id] = p))
    process.stdout.write(`\r  ${Math.min(i + 4, fresh.length)} / ${fresh.length}`)
    await sleep(300)
  }

  const used = new Set(Object.values(rooms).flat())
  for (const id of Object.keys(paintings)) if (!used.has(id)) delete paintings[id]

  await mkdir(new URL('.', OUTPUT), { recursive: true })
  await writeFile(OUTPUT, JSON.stringify({ collectedAt: new Date().toISOString(), rooms, paintings }, null, 1))

  const filled = Object.values(rooms).filter((ids) => ids.length > 0).length
  console.log(`\n\nSaved ${Object.keys(paintings).length} paintings, ${filled} of ${targets.length} rooms filled.`)
  if (problems.length) {
    console.log('\nRooms that need attention:')
    problems.forEach((p) => console.log(`  - ${p}`))
    console.log(`\nRetry just those with: npm run collect -- ${problems.map((p) => p.split(':')[0]).join(' ')}`)
  } else {
    console.log('Every room you collected has paintings.')
  }
}

main().catch((error) => {
  console.error('\nCollection stopped:', error.message)
  process.exit(1)
})
