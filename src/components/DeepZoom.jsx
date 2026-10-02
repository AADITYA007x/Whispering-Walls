import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import OpenSeadragon from 'openseadragon'
import ArtImage from './ArtImage.jsx'
import { zoomSources } from '../api/collection.js'

const FOCUS_SIZE = 0.32

export default function DeepZoom({ ref, painting, hotspots, activeId, draft, showHotspots, onSelect, onCanvasClick }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const callbacks = useRef({ onSelect, onCanvasClick })
  const [status, setStatus] = useState('loading')

  callbacks.current = { onSelect, onCanvasClick }

  useEffect(() => {
    const sources = zoomSources(painting)
    let attempt = 0
    setStatus('loading')

    const viewer = OpenSeadragon({
      element: containerRef.current,
      showNavigationControl: false,
      drawer: 'canvas',
      crossOriginPolicy: 'Anonymous',
      visibilityRatio: 0.9,
      minZoomImageRatio: 0.8,
      maxZoomPixelRatio: 2.5,
      animationTime: 1.1,
      springStiffness: 7,
      gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true },
      gestureSettingsTouch: { pinchToZoom: true, clickToZoom: false, dblClickToZoom: true },
    })
    viewerRef.current = viewer

    const openNext = () => viewer.open({ type: 'image', url: sources[attempt], buildPyramid: true })

    viewer.addHandler('open', () => setStatus('ready'))
    viewer.addHandler('open-failed', () => {
      attempt += 1
      if (attempt < sources.length) openNext()
      else setStatus('failed')
    })
    viewer.addHandler('canvas-click', (event) => {
      if (!event.quick || !callbacks.current.onCanvasClick) return
      const item = viewer.world.getItemAt(0)
      if (!item) return
      const size = item.getContentSize()
      const point = item.viewportToImageCoordinates(viewer.viewport.pointFromPixel(event.position))
      const x = point.x / size.x
      const y = point.y / size.y
      if (x < 0 || x > 1 || y < 0 || y > 1) return
      callbacks.current.onCanvasClick({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) })
    })

    openNext()

    return () => {
      viewer.destroy()
      viewerRef.current = null
    }
  }, [painting])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || status !== 'ready') return
    const item = viewer.world.getItemAt(0)
    if (!item) return
    const size = item.getContentSize()
    viewer.clearOverlays()

    const markers = showHotspots ? hotspots.map((h, i) => ({ ...h, label: String(i + 1) })) : []
    if (draft) markers.push({ ...draft, id: '__draft', label: '+', isDraft: true })

    for (const marker of markers) {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = `hotspot${marker.id === activeId ? ' is-active' : ''}${marker.isDraft ? ' is-draft' : ''}`
      el.textContent = marker.label
      el.setAttribute('aria-label', marker.isDraft ? 'New hotspot' : marker.title)
      if (!marker.isDraft) {
        new OpenSeadragon.MouseTracker({
          element: el,
          clickHandler: () => callbacks.current.onSelect?.(marker.id),
        })
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            callbacks.current.onSelect?.(marker.id)
          }
        })
      }
      viewer.addOverlay({
        element: el,
        location: item.imageToViewportCoordinates(marker.x * size.x, marker.y * size.y),
        placement: OpenSeadragon.Placement.CENTER,
        checkResize: false,
      })
    }
  }, [status, hotspots, activeId, draft, showHotspots])

  useImperativeHandle(ref, () => ({
    zoomBy(factor) {
      const viewer = viewerRef.current
      if (!viewer) return
      viewer.viewport.zoomBy(factor)
      viewer.viewport.applyConstraints()
    },
    home() {
      viewerRef.current?.viewport.goHome()
    },
    focus(hotspot) {
      const viewer = viewerRef.current
      const item = viewer?.world.getItemAt(0)
      if (!item) return
      const size = item.getContentSize()
      const center = item.imageToViewportCoordinates(hotspot.x * size.x, hotspot.y * size.y)
      const half = FOCUS_SIZE / 2
      viewer.viewport.fitBounds(new OpenSeadragon.Rect(center.x - half, center.y - half, FOCUS_SIZE, FOCUS_SIZE))
    },
  }))

  return (
    <div className="zoom-stage relative">
      <div ref={containerRef} className="absolute inset-0" />
      {status === 'loading' && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm opacity-70">Lighting the painting…</p>
      )}
      {status === 'failed' && (
        <div className="absolute inset-0 grid place-items-center p-6">
          <ArtImage painting={painting} large className="max-h-full w-auto max-w-full" />
        </div>
      )}
    </div>
  )
}
