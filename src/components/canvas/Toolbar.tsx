import React, { useState, useEffect } from 'react'
import {
  TrafficCone, Type, Image, Clock, Dices, Timer as TimerIcon,
  Circle, Pencil, Palette, Hand, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import type { WidgetType } from '../../store/boardStore'

const TOOLS: { type: WidgetType; icon: React.ReactNode; label: string; emoji: string }[] = [
  { type: 'trafikklys', icon: <TrafficCone size={22} />, label: 'Trafikklys', emoji: '🚦' },
  { type: 'tekst', icon: <Type size={22} />, label: 'Tekst', emoji: '✏️' },
  { type: 'bilde', icon: <Image size={22} />, label: 'Bilde', emoji: '🖼️' },
  { type: 'klokke', icon: <Clock size={22} />, label: 'Klokke', emoji: '🕐' },
  { type: 'terning', icon: <Dices size={22} />, label: 'Terning', emoji: '🎲' },
  { type: 'timer', icon: <TimerIcon size={22} />, label: 'Timer', emoji: '⏱️' },
  { type: 'snurrehjul', icon: <Circle size={22} />, label: 'Snurrehjul', emoji: '🎡' },
  { type: 'tegning', icon: <Pencil size={22} />, label: 'Tegning', emoji: '🎨' },
  { type: 'bakgrunn', icon: <Palette size={22} />, label: 'Bakgrunn', emoji: '🖼' },
  { type: 'gestu', icon: <Hand size={22} />, label: 'Gestus', emoji: '👋' },
]

export function Toolbar() {
  const { addWidget, clearBoard, widgets, background } = useBoardStore()
  const [collapsed, setCollapsed] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  // Auto-save indicator: Zustand persist writes to localStorage on every change.
  // We debounce 600ms so the "✓ Lagret" badge appears shortly after each edit.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLastSaved(new Date())
      setJustSaved(true)
      const fadeTimer = setTimeout(() => setJustSaved(false), 2000)
      return () => clearTimeout(fadeTimer)
    }, 600)
    return () => clearTimeout(timer)
  }, [widgets, background])

  return (
    <div
      className="fixed left-0 top-0 h-full z-[9999] flex items-center"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Main toolbar panel */}
        <div
          className={`flex flex-col gap-1 py-3 px-2 rounded-r-2xl transition-all duration-300 ${
            collapsed ? 'translate-x-[-100%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
          }`}
          style={{
            background: 'rgba(15,15,30,0.92)',
            backdropFilter: 'blur(20px)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: 'none',
            minWidth: '68px',
          }}
        >
          <div className="text-center mb-1">
            <span className="text-white/40 text-xs font-bold tracking-widest">SKOLE</span>
          </div>

          {TOOLS.map((tool) => (
            <button
              key={tool.type}
              onClick={() => addWidget(tool.type)}
              title={tool.label}
              className="group flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-150"
            >
              <span className="text-xl leading-none">{tool.emoji}</span>
              <span className="text-white/50 text-[10px] group-hover:text-white/80 transition-colors">
                {tool.label}
              </span>
            </button>
          ))}

          <div className="h-px bg-white/10 my-1" />

          {/* Clear board */}
          {showConfirmClear ? (
            <div className="flex flex-col gap-1 px-1">
              <span className="text-white/60 text-[10px] text-center">Sikker?</span>
              <button
                onClick={() => { clearBoard(); setShowConfirmClear(false) }}
                className="text-red-400 text-xs hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                Ja
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="text-white/50 text-xs hover:text-white/80 transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              >
                Nei
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              title="Tøm tavlen"
              className="group flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={18} className="text-white/40 group-hover:text-red-400 transition-colors" />
              <span className="text-white/30 text-[10px] group-hover:text-red-400/80">Tøm</span>
            </button>
          )}

          {/* Auto-save status */}
          <div className="h-px bg-white/10 my-1" />
          <div className="flex flex-col items-center gap-0.5 px-1 pb-1 min-h-[28px] justify-center">
            {justSaved ? (
              <span className="text-green-400 text-[9px] font-medium tracking-wide animate-pulse">
                ✓ Lagret
              </span>
            ) : lastSaved ? (
              <span className="text-white/20 text-[9px] text-center leading-tight">
                💾 {lastSaved.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <span className="text-white/15 text-[9px]">lokalt</span>
            )}
          </div>
        </div>

        {/* Collapse toggle tab */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-[-28px] top-1/2 -translate-y-1/2 w-7 h-12 flex items-center justify-center rounded-r-xl transition-all hover:bg-white/10"
          style={{
            background: 'rgba(15,15,30,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: 'none',
          }}
        >
          {collapsed
            ? <ChevronRight size={14} className="text-white/60" />
            : <ChevronLeft size={14} className="text-white/60" />
          }
        </button>
      </div>
    </div>
  )
}
