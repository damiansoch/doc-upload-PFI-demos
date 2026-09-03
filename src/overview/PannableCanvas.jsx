import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_SCALE = 0.4
const MAX_SCALE = 2

// A free-form canvas the mouse can drag to move in any direction — not a
// scrollbar-constrained viewport. Click-drag pans, wheel pans, ctrl/cmd+wheel
// zooms toward the cursor. Content is centered on mount based on its known
// pixel size vs. the current viewport.
export default function PannableCanvas({ contentWidth, contentHeight, children }) {
  const viewportRef = useRef(null)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const moved = useRef(false)

  // Centers against the window, not the ref's measured rect — on first mount
  // the viewport div can still report a zero-size bounding rect (measured
  // before layout has actually run), which silently shifted the whole canvas
  // off-screen. window.innerWidth/innerHeight are always correct immediately,
  // and this container is deliberately sized to match them (h-screen w-screen).
  useEffect(() => {
    setTransform({
      x: (window.innerWidth - contentWidth) / 2,
      y: (window.innerHeight - contentHeight) / 2,
      scale: 1,
    })
  }, [contentWidth, contentHeight])

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    dragging.current = true
    moved.current = false
    last.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true
    last.current = { x: e.clientX, y: e.clientY }
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))
  }, [])

  const stopDrag = useCallback(() => {
    dragging.current = false
  }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      setTransform((t) => {
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale - e.deltaY * 0.0015))
        const rect = viewportRef.current.getBoundingClientRect()
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        // zoom toward the cursor: keep the point under it fixed
        const ratio = nextScale / t.scale
        return {
          scale: nextScale,
          x: cx - (cx - t.x) * ratio,
          y: cy - (cy - t.y) * ratio,
        }
      })
    } else {
      setTransform((t) => ({ ...t, x: t.x - e.deltaX, y: t.y - e.deltaY }))
    }
  }, [])

  const resetView = useCallback(() => {
    const vp = viewportRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    setTransform({
      x: (rect.width - contentWidth) / 2,
      y: (rect.height - contentHeight) / 2,
      scale: 1,
    })
  }, [contentWidth, contentHeight])

  const zoomBy = useCallback((factor) => {
    setTransform((t) => {
      const vp = viewportRef.current
      const rect = vp.getBoundingClientRect()
      const cx = rect.width / 2
      const cy = rect.height / 2
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor))
      const ratio = nextScale / t.scale
      return {
        scale: nextScale,
        x: cx - (cx - t.x) * ratio,
        y: cy - (cy - t.y) * ratio,
      }
    })
  }, [])

  return (
    <div
      ref={viewportRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onWheel={onWheel}
      className="relative h-screen w-screen overflow-hidden bg-white"
      style={{
        cursor: dragging.current ? 'grabbing' : 'grab',
        backgroundImage: 'radial-gradient(circle, #E2E2E2 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
        backgroundPosition: `${transform.x}px ${transform.y}px`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: contentWidth,
          height: contentHeight,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border1 bg-white px-2 py-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => zoomBy(0.85)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg font-medium text-ink hover:bg-[#F5F5F4]"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[3.5rem] text-center font-sans text-xs font-medium text-muted">
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => zoomBy(1 / 0.85)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-lg font-medium text-ink hover:bg-[#F5F5F4]"
            aria-label="Zoom in"
          >
            +
          </button>
          <span className="mx-1 h-4 w-px bg-border1" />
          <button
            type="button"
            onClick={resetView}
            className="rounded-full px-3 py-1 font-sans text-xs font-medium text-ink hover:bg-[#F5F5F4]"
          >
            Reset view
          </button>
        </div>
      </div>
    </div>
  )
}
