import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import DeepZoom from '../components/DeepZoom.jsx'
import HotspotEditor from '../components/HotspotEditor.jsx'
import AskPainting from '../components/AskPainting.jsx'
import NotFound from './NotFound.jsx'
import { VIEWING_ROOM } from '../data/museum.js'
import { getPainting } from '../api/collection.js'
import { getHotspots, saveHotspots } from '../api/hotspots.js'
import { useWall } from '../hooks/useWall.js'
import { useNarrator } from '../hooks/useNarrator.js'
import { usePostcards } from '../hooks/usePostcards.js'

const TOUR_STEP_MS = 6500
const canEdit = import.meta.env.DEV

function ControlButton({ onClick, label, children, pressed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="h-10 border border-ivory/40 px-4 text-sm transition-colors hover:bg-ivory/10 aria-pressed:border-gilt aria-pressed:bg-gilt aria-pressed:text-ink"
    >
      {children}
    </button>
  )
}

function IconButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-10 w-11 place-items-center border-r border-ivory/40 transition-colors last:border-r-0 hover:bg-ivory/10"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-t border-ivory/15 py-2.5 text-sm">
      <dt className="opacity-60">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function PaintingView({ painting }) {
  const navigate = useNavigate()
  const zoomRef = useRef(null)
  const [hotspots, setHotspots] = useState(() => getHotspots(painting.id))
  const [activeId, setActiveId] = useState(null)
  const [showHotspots, setShowHotspots] = useState(true)
  const [touring, setTouring] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [editing, setEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')
  const [readAloud, setReadAloud] = useState(false)
  const narrator = useNarrator()
  const postcards = usePostcards()
  const saved = postcards.isSaved(painting.id)
  const touringRef = useRef(false)
  const quietNext = useRef(false)
  touringRef.current = touring

  const active = hotspots.find((h) => h.id === activeId)
  const activeIndex = hotspots.findIndex((h) => h.id === activeId)

  useEffect(() => {
    if (!touring) return
    if (tourStep >= hotspots.length) {
      if (readAloud) quietNext.current = true
      setTouring(false)
      setActiveId(null)
      zoomRef.current?.home()
      return
    }
    const spot = hotspots[tourStep]
    setActiveId(spot.id)
    zoomRef.current?.focus(spot)
    if (readAloud) return
    const timer = setTimeout(() => setTourStep((s) => s + 1), TOUR_STEP_MS)
    return () => clearTimeout(timer)
  }, [touring, tourStep, hotspots, readAloud])

  useEffect(() => {
    if (!readAloud) {
      narrator.stop()
      return
    }
    if (quietNext.current) {
      quietNext.current = false
      return
    }
    const spot = hotspots.find((h) => h.id === activeId)
    const text = spot
      ? `${spot.title}. ${spot.story}`
      : `${painting.title}, by ${painting.artist}. ${painting.story || ''}`
    let timer
    narrator.speak(text, () => {
      if (touringRef.current) timer = setTimeout(() => setTourStep((s) => s + 1), 900)
    })
    return () => clearTimeout(timer)
  }, [readAloud, activeId])

  function select(id) {
    if (editing) return
    setTouring(false)
    const spot = hotspots.find((h) => h.id === id)
    setActiveId(id)
    if (spot) zoomRef.current?.focus(spot)
  }

  function showWhole() {
    setTouring(false)
    setActiveId(null)
    zoomRef.current?.home()
  }

  function goToIndex(index) {
    const spot = hotspots[index]
    if (spot) select(spot.id)
  }

  function toggleTour() {
    if (touring) return showWhole()
    setShowHotspots(true)
    setTourStep(0)
    setTouring(true)
  }

  function goBack() {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/')
  }

  async function persist(next, message) {
    setHotspots(next)
    try {
      await saveHotspots(painting.id, next)
      setSaveStatus(message)
    } catch {
      setSaveStatus("Couldn't save. Make sure npm run dev is still running.")
    }
  }

  function startEditing() {
    setTouring(false)
    setActiveId(null)
    setEditing((e) => !e)
    setDraft(null)
    setEditingId(null)
    setSaveStatus('')
  }

  function editExisting(id) {
    const spot = hotspots.find((h) => h.id === id)
    setEditingId(id)
    setDraft({ x: spot.x, y: spot.y })
    zoomRef.current?.focus(spot)
  }

  function saveForm({ title, story }) {
    if (editingId) {
      const next = hotspots.map((h) => (h.id === editingId ? { ...h, ...draft, title, story } : h))
      persist(next, `Saved "${title}".`)
    } else {
      const id = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`
      persist([...hotspots, { id, ...draft, title, story }], `Added "${title}".`)
    }
    setDraft(null)
    setEditingId(null)
  }

  function deleteHotspot(id) {
    persist(
      hotspots.filter((h) => h.id !== id),
      'Hotspot deleted.',
    )
    setDraft(null)
    setEditingId(null)
  }

  const visibleHotspots = editingId ? hotspots.filter((h) => h.id !== editingId) : hotspots

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <button type="button" onClick={goBack} className="text-sm opacity-80 hover:underline">
        Back to the room
      </button>

      <article className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <div className="gilt-frame">
            <DeepZoom
              ref={zoomRef}
              painting={painting}
              hotspots={visibleHotspots}
              activeId={activeId}
              draft={editing ? draft : null}
              showHotspots={showHotspots || editing}
              onSelect={select}
              onCanvasClick={editing ? (point) => setDraft(point) : null}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Zoom" className="flex border border-ivory/40">
              <IconButton onClick={() => zoomRef.current?.zoomBy(1 / 1.5)} label="Zoom out">
                <path d="M5 12h14" />
              </IconButton>
              <IconButton onClick={() => zoomRef.current?.zoomBy(1.5)} label="Zoom in">
                <path d="M5 12h14M12 5v14" />
              </IconButton>
              <IconButton onClick={showWhole} label="Show the whole painting">
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </IconButton>
            </div>

            {!editing && (
              <div role="group" aria-label="Explore" className="flex flex-wrap gap-2">
                {hotspots.length > 0 && (
                  <>
                    <ControlButton onClick={toggleTour} label={touring ? 'Stop the tour' : 'Start the look closer tour'} pressed={touring}>
                      {touring ? 'Stop tour' : 'Look closer tour'}
                    </ControlButton>
                    <ControlButton onClick={() => setShowHotspots((s) => !s)} label="Show hidden details" pressed={showHotspots}>
                      Details
                    </ControlButton>
                  </>
                )}
                {narrator.supported && (
                  <ControlButton onClick={() => setReadAloud((r) => !r)} label="Read stories aloud" pressed={readAloud}>
                    {readAloud && narrator.speaking ? 'Reading…' : 'Read aloud'}
                  </ControlButton>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-ivory/15 pt-3">
            <button
              type="button"
              onClick={() => postcards.toggle(painting.id)}
              aria-pressed={saved}
              className="inline-flex items-center gap-2 px-1 py-1.5 text-sm transition-opacity hover:opacity-100 aria-pressed:text-gilt opacity-90"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
                <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
              </svg>
              {saved ? 'Saved to postcards' : 'Save postcard'}
            </button>
            {canEdit && (
              <button type="button" onClick={startEditing} aria-pressed={editing} className="px-1 py-1.5 text-sm underline underline-offset-4 opacity-80 hover:opacity-100">
                {editing ? 'Done editing' : 'Edit hotspots'}
              </button>
            )}
            <p className="ml-auto text-xs opacity-60">Scroll or pinch to zoom, drag to look around.</p>
          </div>
        </div>

        <div className="pb-6">
          <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">{painting.title}</h1>
          <p className="mt-3 text-lg opacity-85">{painting.artist}</p>

          {editing ? (
            <div className="mt-8">
              <HotspotEditor
                key={editingId || 'new'}
                hotspots={hotspots}
                draft={draft}
                editingId={editingId}
                onEdit={editExisting}
                onSave={saveForm}
                onDelete={deleteHotspot}
                onCancel={() => {
                  setDraft(null)
                  setEditingId(null)
                }}
                status={saveStatus}
              />
            </div>
          ) : active ? (
            <section aria-live="polite" className="mt-8 border-l-2 border-gilt pl-5">
              <p className="text-sm opacity-70">
                Detail {activeIndex + 1} of {hotspots.length}
              </p>
              <h2 className="mt-1 font-display text-2xl font-medium">{active.title}</h2>
              <p className="mt-3 max-w-[60ch] font-display text-lg leading-relaxed">{active.story}</p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                {activeIndex > 0 && (
                  <button type="button" onClick={() => goToIndex(activeIndex - 1)} className="underline underline-offset-4">
                    Previous detail
                  </button>
                )}
                {activeIndex < hotspots.length - 1 && (
                  <button type="button" onClick={() => goToIndex(activeIndex + 1)} className="underline underline-offset-4">
                    Next detail
                  </button>
                )}
                <button type="button" onClick={showWhole} className="underline underline-offset-4">
                  Back to the whole painting
                </button>
              </div>
            </section>
          ) : (
            <>
              <dl className="mt-8">
                <Detail label="Painted" value={painting.year} />
                <Detail label="Held at" value={painting.collection} />
              </dl>
              {hotspots.length > 0 && (
                <p className="mt-6 text-sm opacity-80">
                  This painting has {hotspots.length} hidden details. Tap a glowing marker, or take the tour.
                </p>
              )}
              {painting.story && (
                <p className="mt-8 max-w-[62ch] font-display text-lg leading-relaxed">{painting.story}</p>
              )}
              <a
                href={painting.wikipedia}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
              >
                Read the full story on Wikipedia
              </a>
            </>
          )}
          {!editing && <AskPainting painting={painting} />}
        </div>
      </article>
    </div>
  )
}

export default function Painting() {
  const { id } = useParams()
  const painting = getPainting(id)
  useWall(VIEWING_ROOM.wall, VIEWING_ROOM.text)

  if (!painting) return <NotFound />
  return <PaintingView key={painting.id} painting={painting} />
}
