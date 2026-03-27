import { useState } from 'react'
import { ZoomIn, ZoomOut, Settings, EyeOff, Eye } from 'lucide-react'
import { useTimelineStore, ZOOM_LEVELS } from '../../store/timelineStore'
import { TIMELINE_BAR_HEIGHT } from './Timeline'
import { TimelineSettings } from './TimelineSettings'

export function TimelineControls() {
  const { visible, zoom, toggle, setZoom } = useTimelineStore()
  const [showSettings, setShowSettings] = useState(false)

  function zoomIn() {
    const idx = ZOOM_LEVELS.indexOf(zoom as typeof ZOOM_LEVELS[number])
    if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1])
  }
  function zoomOut() {
    const idx = ZOOM_LEVELS.indexOf(zoom as typeof ZOOM_LEVELS[number])
    if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1])
  }

  return (
    <>
      {showSettings && (
        <TimelineSettings
          onClose={() => setShowSettings(false)}
          topOffset={visible ? TIMELINE_BAR_HEIGHT : 0}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onToggle={toggle}
          zoom={zoom}
        />
      )}

      {/* Horizontal pill — top-right */}
      <div
        className="fixed right-2 z-[9999] flex items-center gap-0.5 px-1.5 py-1 rounded-full select-none"
        style={{
          top: visible ? TIMELINE_BAR_HEIGHT + 6 : 6,
          background: 'rgba(12,12,28,0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          transition: 'top 0.2s ease',
        }}
      >
        <button
          onClick={zoomOut}
          disabled={zoom === ZOOM_LEVELS[0]}
          title="Zoom ut"
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-25 transition-all"
        >
          <ZoomOut size={12} className="text-white/60" />
        </button>

        <span className="text-white/35 font-mono text-[10px] px-0.5 min-w-[22px] text-center">
          {zoom}×
        </span>

        <button
          onClick={zoomIn}
          disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          title="Zoom inn"
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-25 transition-all"
        >
          <ZoomIn size={12} className="text-white/60" />
        </button>

        <div className="w-px h-3 bg-white/10 mx-0.5" />

        <button
          onClick={() => setShowSettings((v) => !v)}
          title="Innstillinger"
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
        >
          <Settings size={12} className={showSettings ? 'text-blue-400' : 'text-white/50'} />
        </button>

        <button
          onClick={toggle}
          title={visible ? 'Skjul tidslinje' : 'Vis tidslinje'}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
        >
          {visible
            ? <EyeOff size={12} className="text-white/40" />
            : <Eye    size={12} className="text-white/60" />
          }
        </button>
      </div>
    </>
  )
}
