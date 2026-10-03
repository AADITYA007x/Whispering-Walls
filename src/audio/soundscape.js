const API = 'https://commons.wikimedia.org/w/api.php'
const VOLUME = 0.55
const DUCKED = 0.15
const FADE_MS = 2500
const MIN_SECONDS = 90

const MOODS = {
  gallery: {
    titles: [
      'Erik Satie - gymnopedies - la 1 ere. lent et douloureux.ogg',
      'Clair de lune (Claude Debussy) Suite bergamasque.ogg',
    ],
    searches: ['Satie Gymnopédie piano', 'Musopen piano Debussy'],
  },
  candle: {
    titles: ['Frederic Chopin - Nocturne Eb major Opus 9, number 2.ogg'],
    searches: ['Chopin Nocturne piano', 'Musopen Chopin'],
  },
  sea: {
    titles: ['Clair de lune (Claude Debussy) Suite bergamasque.ogg'],
    searches: ['Debussy Arabesque piano', 'Debussy piano'],
  },
  rain: {
    titles: [],
    searches: ['koto music Japanese', 'shakuhachi music'],
  },
  wind: {
    titles: ['01 - Vivaldi Spring mvt 1 Allegro - John Harrison violin.ogg'],
    searches: ['Vivaldi Spring violin', 'Grieg Morning Mood'],
  },
}

const cache = {}
const listeners = new Set()
let enabled = false
let wantedMood = 'gallery'
let playingMood = null
let ducked = false
let active = null
let nowPlaying = null
let queue = []

function notify() {
  for (const fn of listeners) fn(nowPlaying)
}

function toTrack(page) {
  const info = page.videoinfo?.[0] || page.imageinfo?.[0]
  if (!info?.url) return null
  if (info.duration && info.duration < MIN_SECONDS) return null
  const mp3 = info.derivatives?.find((d) => d.type?.includes('mpeg') || d.transcodekey === 'mp3')
  const name = page.title.replace(/^File:/, '').replace(/\.(ogg|oga|opus|flac|wav|mp3)$/i, '').replace(/_/g, ' ')
  return { name, sources: [mp3?.src, info.url].filter(Boolean), page: info.descriptionurl }
}

async function query(params) {
  const url = `${API}?${new URLSearchParams({ action: 'query', format: 'json', origin: '*', prop: 'videoinfo', viprop: 'url|derivatives|size', ...params })}`
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json()
  return Object.values(json.query?.pages || {}).filter((p) => !('missing' in p)).map(toTrack).filter(Boolean)
}

async function tracksFor(mood) {
  if (cache[mood]) return cache[mood]
  const spec = MOODS[mood] || MOODS.gallery
  const found = []
  try {
    if (spec.titles.length) found.push(...(await query({ titles: spec.titles.map((t) => `File:${t}`).join('|') })))
    for (const search of spec.searches) {
      if (found.length >= 4) break
      found.push(...(await query({ generator: 'search', gsrnamespace: '6', gsrlimit: '6', gsrsearch: `${search} filetype:audio` })))
    }
  } catch {
    /* offline or blocked */
  }
  const unique = [...new Map(found.map((t) => [t.sources[0], t])).values()]
  if (unique.length) cache[mood] = unique
  return unique
}

function fade(audio, to, done) {
  const start = audio.volume
  const begin = performance.now()
  clearInterval(audio._fade)
  audio._fade = setInterval(() => {
    const p = Math.min(1, (performance.now() - begin) / FADE_MS)
    audio.volume = Math.max(0, Math.min(1, start + (to - start) * p))
    if (p >= 1) {
      clearInterval(audio._fade)
      done?.()
    }
  }, 50)
}

function stopActive() {
  if (!active) return
  const old = active
  active = null
  fade(old, 0, () => {
    old.pause()
    old.src = ''
  })
}

async function playNext() {
  const mood = wantedMood
  if (!queue.length) {
    const tracks = await tracksFor(mood)
    queue = [...tracks].sort(() => Math.random() - 0.5)
  }
  if (!enabled || mood !== wantedMood) return
  const track = queue.shift()
  if (!track) {
    nowPlaying = { name: 'No music found for this room right now', page: null }
    notify()
    return
  }
  const audio = new Audio()
  audio.preload = 'auto'
  audio.volume = 0
  let sourceIndex = 0
  audio.src = track.sources[0]
  audio.onerror = () => {
    sourceIndex += 1
    if (sourceIndex < track.sources.length) {
      audio.src = track.sources[sourceIndex]
      audio.play().catch(() => {})
    } else if (active === audio) {
      active = null
      playNext()
    }
  }
  audio.onended = () => {
    if (active === audio) {
      active = null
      playNext()
    }
  }
  stopActive()
  active = audio
  playingMood = mood
  nowPlaying = track
  notify()
  try {
    await audio.play()
  } catch {
    /* autoplay blocked until the visitor clicks */
  }
  fade(audio, ducked ? DUCKED : VOLUME)
}

function applyMood() {
  if (!enabled) return
  if (playingMood === wantedMood && active) return
  queue = []
  playNext()
}

export function isSupported() {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined'
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function setEnabled(on) {
  enabled = on
  if (on) applyMood()
  else {
    stopActive()
    playingMood = null
    nowPlaying = null
    notify()
  }
}

export function setScene(name) {
  wantedMood = MOODS[name] ? name : 'gallery'
  applyMood()
}

export function skip() {
  if (!enabled) return
  playNext()
}

export function duck(on) {
  ducked = on
  if (active) fade(active, on ? DUCKED : VOLUME)
}
