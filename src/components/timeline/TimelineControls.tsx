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

      {/* Horizontal pill — top-right, paper style */}
      <div
        className="fixed right-2 z-[9999] flex items-center gap-0.5 px-1.5 py-1 rounded-full select-none"
        style={{
          top: visible ? TIMELINE_BAR_HEIGHT + 6 : 6,
          background: 'var(--panel-bg)',
          border: '2px solid var(--panel-border)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'top 0.2s ease',
        }}
      >
        <button
          onClick={zoomOut}
          disabled={zoom === ZOOM_LEVELS[0]}
          title="Zoom ut"
          className="w-6 h-6 flex items-center justify-center rounded-full transition-all disabled:opacity-25"
          style={{ color: '#9DB2BC' }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = '#F3F0FF'; e.currentTarget.style.color = '#7C3AED' } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9DB2BC' }}
        >
          <ZoomOut size={12} />
        </button>

        <span
          className="font-mono text-[10px] px-0.5 min-w-[22px] text-center font-bold"
          style={{ color: '#9DB2BC' }}
        >
          {zoom}×
        </span>

        <button
          onClick={zoomIn}
          disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          title="Zoom inn"
          className="w-6 h-6 flex items-center justify-center rounded-full transition-all disabled:opacity-25"
          style={{ color: '#9DB2BC' }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = '#F3F0FF'; e.currentTarget.style.color = '#7C3AED' } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9DB2BC' }}
        >
          <ZoomIn size={12} />
        </button>

        <div className="w-px h-3 mx-0.5" style={{ background: 'var(--panel-border)' }} />

        <button
          onClick={() => setShowSettings((v) => !v)}
          title="Innstillinger"
          className="w-6 h-6 flex items-center justify-center rounded-full transition-all"
          style={{ color: showSettings ? '#7C3AED' : '#9DB2BC', background: showSettings ? '#F3F0FF' : 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F0FF'; e.currentTarget.style.color = '#7C3AED' }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = showSettings ? '#F3F0FF' : 'transparent'
            e.currentTarget.style.color = showSettings ? '#7C3AED' : '#9DB2BC'
          }}
        >
          <Settings size={12} />
        </button>

        <button
          onClick={toggle}
          title={visible ? 'Skjul tidslinje' : 'Vis tidslinje'}
          className="w-6 h-6 flex items-center justify-center rounded-full transition-all"
          style={{ color: '#9DB2BC' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F0FF'; e.currentTarget.style.color = '#7C3AED' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9DB2BC' }}
        >
          {visible ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </>
  )
}
