import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import { GESTURES } from '../../lib/gestures'
import { X } from 'lucide-react'

export function Gestu({ widget }: { widget: Widget }) {
  const { updateWidgetData, setGlobalGesture, globalGestureId } = useBoardStore()

  const activeId = widget.data.active as string | null
  const activeGesture = GESTURES.find((g) => g.id === activeId)

  const handleSelect = (id: string) => {
    if (activeId === id) {
      // Toggle off
      updateWidgetData(widget.id, { active: null })
      setGlobalGesture(null)
    } else {
      updateWidgetData(widget.id, { active: id })
      setGlobalGesture(id)
    }
  }

  const handleClear = () => {
    updateWidgetData(widget.id, { active: null })
    setGlobalGesture(null)
  }

  return (
    <WidgetWrapper widget={widget} minWidth={260} minHeight={220} title="Gestus">
      <div className="flex flex-col h-full" style={{ background: 'rgba(10,10,25,0.7)' }}>

        {/* Gesture grid */}
        <div className="flex-1 overflow-y-auto p-2 grid grid-cols-3 gap-1.5 content-start">
          {GESTURES.map((g) => {
            const isActive = activeId === g.id
            return (
              <button
                key={g.id}
                onClick={() => handleSelect(g.id)}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-150 border-2 ${
                  isActive
                    ? 'scale-105 border-white/60'
                    : 'border-transparent hover:border-white/20 hover:scale-[1.02]'
                }`}
                style={{
                  background: isActive ? g.color + '44' : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive ? `0 0 18px ${g.color}55` : undefined,
                }}
              >
                <span className="text-3xl leading-none">{g.emoji}</span>
                <span className="text-white/80 text-[10px] text-center leading-tight">{g.label}</span>
              </button>
            )
          })}
        </div>

        {/* Active gesture bar */}
        {activeGesture && (
          <div
            className="shrink-0 flex items-center gap-2 px-3 py-2 border-t border-white/10"
            style={{ background: activeGesture.color + '33' }}
          >
            <span className="text-xl">{activeGesture.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{activeGesture.label}</div>
              <div className="text-white/50 text-[10px] truncate">{activeGesture.sublabel}</div>
            </div>
            {/* Show whether it's currently on the global overlay */}
            {globalGestureId === activeId ? (
              <span className="text-[9px] text-white/40 shrink-0">Vises på skjerm</span>
            ) : (
              <button
                onClick={() => setGlobalGesture(activeId)}
                className="text-[9px] text-white/50 hover:text-white/80 shrink-0 px-1.5 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                Vis
              </button>
            )}
            <button
              onClick={handleClear}
              className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-full hover:bg-white/10 shrink-0"
              title="Fjern gestus"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </WidgetWrapper>
  )
}
