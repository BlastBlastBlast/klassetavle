import { useState } from 'react'
import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'

interface Gesture {
  id: string
  emoji: string
  label: string
  sublabel: string
  color: string
}

const GESTURES: Gesture[] = [
  { id: 'stille', emoji: '🤫', label: 'Vær stille', sublabel: 'Ingen lyd nå', color: '#6366f1' },
  { id: 'snakk', emoji: '🗣️', label: 'Snakk sammen', sublabel: 'Diskuter med naboen', color: '#22c55e' },
  { id: 'rekk', emoji: '✋', label: 'Rekk opp hånden', sublabel: 'Vil du si noe?', color: '#f59e0b' },
  { id: 'jobb', emoji: '✏️', label: 'Jobbe alene', sublabel: 'Konsentrer deg', color: '#3b82f6' },
  { id: 'lytt', emoji: '👂', label: 'Lytt godt', sublabel: 'Hør etter nå', color: '#8b5cf6' },
  { id: 'se', emoji: '👀', label: 'Se opp', sublabel: 'Se på tavlen', color: '#06b6d4' },
  { id: 'pause', emoji: '☕', label: 'Pause', sublabel: 'Hvil litt', color: '#f97316' },
  { id: 'bra', emoji: '👍', label: 'Bra jobbet!', sublabel: 'Flott innsats!', color: '#10b981' },
  { id: 'toalett', emoji: '🚻', label: 'Toalett', sublabel: 'Gå én om gangen', color: '#64748b' },
  { id: 'pakk', emoji: '🎒', label: 'Pakk sammen', sublabel: 'Rydd og gjør deg klar', color: '#7c3aed' },
  { id: 'ute', emoji: '🌤️', label: 'Utetid', sublabel: 'Ta på deg jakken', color: '#0ea5e9' },
  { id: 'les', emoji: '📖', label: 'Les stille', sublabel: 'Lesetid nå', color: '#ec4899' },
]

export function Gestu({ widget }: { widget: Widget }) {
  const { updateWidgetData } = useBoardStore()
  const active = widget.data.active as string | null
  const [bigMode, setBigMode] = useState(false)

  const setActive = (id: string) =>
    updateWidgetData(widget.id, { active: active === id ? null : id })

  const activeGesture = GESTURES.find((g) => g.id === active)

  return (
    <WidgetWrapper widget={widget} minWidth={260} minHeight={200} title="Gestus">
      <div className="flex flex-col h-full bg-gradient-to-b from-gray-900/80 to-black/60">
        {/* Big display mode */}
        {bigMode && activeGesture && (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer animate-bounce-in"
            style={{ backgroundColor: activeGesture.color + '22' }}
            onClick={() => setBigMode(false)}
          >
            <div className="text-8xl">{activeGesture.emoji}</div>
            <div className="text-white text-2xl font-bold">{activeGesture.label}</div>
            <div className="text-white/60 text-base">{activeGesture.sublabel}</div>
            <div className="text-white/30 text-xs mt-4">Klikk for å lukke</div>
          </div>
        )}

        {/* Grid */}
        {!bigMode && (
          <div className="flex-1 overflow-y-auto p-2 grid grid-cols-3 gap-2 content-start">
            {GESTURES.map((g) => (
              <button
                key={g.id}
                onClick={() => { setActive(g.id); if (active !== g.id) setBigMode(true) }}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all cursor-pointer border-2 ${
                  active === g.id
                    ? 'border-white/50 scale-105'
                    : 'border-transparent hover:border-white/20 hover:scale-102'
                }`}
                style={{
                  background: active === g.id ? g.color + '44' : 'rgba(255,255,255,0.05)',
                  boxShadow: active === g.id ? `0 0 20px ${g.color}55` : undefined,
                }}
              >
                <span className="text-3xl leading-none">{g.emoji}</span>
                <span className="text-white/80 text-[10px] text-center leading-tight">{g.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Current selection bar */}
        {activeGesture && !bigMode && (
          <div
            className="flex items-center gap-2 px-3 py-2 border-t border-white/10 cursor-pointer hover:opacity-80"
            style={{ background: activeGesture.color + '33' }}
            onClick={() => setBigMode(true)}
          >
            <span className="text-2xl">{activeGesture.emoji}</span>
            <div>
              <div className="text-white text-sm font-semibold">{activeGesture.label}</div>
              <div className="text-white/50 text-xs">{activeGesture.sublabel}</div>
            </div>
            <span className="ml-auto text-white/30 text-xs">Forstørr →</span>
          </div>
        )}
      </div>
    </WidgetWrapper>
  )
}
