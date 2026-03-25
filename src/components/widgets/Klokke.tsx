import { useEffect, useState } from 'react'
import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import { Plus, Trash2, Clock } from 'lucide-react'

interface TimelineItem { id: string; time: string; label: string }

function AnalogClock({ size }: { size: number }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const s = now.getSeconds()
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60

  const hand = (deg: number, len: number, width: number, color: string) => {
    const rad = (deg - 90) * (Math.PI / 180)
    const cx = size / 2, cy = size / 2
    return (
      <line
        x1={cx} y1={cy}
        x2={cx + Math.cos(rad) * len}
        y2={cy + Math.sin(rad) * len}
        stroke={color} strokeWidth={width} strokeLinecap="round"
      />
    )
  }

  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={size/2 - 2} fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
      {[...Array(12)].map((_, i) => {
        const rad = (i * 30 - 90) * Math.PI / 180
        const r1 = size/2 - 8, r2 = size/2 - 16
        return (
          <line
            key={i}
            x1={size/2 + Math.cos(rad) * r1}
            y1={size/2 + Math.sin(rad) * r1}
            x2={size/2 + Math.cos(rad) * r2}
            y2={size/2 + Math.sin(rad) * r2}
            stroke="rgba(255,255,255,0.5)" strokeWidth={i % 3 === 0 ? 2 : 1}
          />
        )
      })}
      {hand(h * 30, size * 0.28, 4, '#ffffff')}
      {hand(m * 6, size * 0.36, 3, '#60a5fa')}
      {hand(s * 6, size * 0.38, 1.5, '#f87171')}
      <circle cx={size/2} cy={size/2} r={4} fill="#ffffff" />
    </svg>
  )
}

export function Klokke({ widget }: { widget: Widget }) {
  const { updateWidgetData } = useBoardStore()
  const [now, setNow] = useState(new Date())
  const timeline = (widget.data.timeline as TimelineItem[]) ?? []
  const showTimeline = (widget.data.showTimeline as boolean) ?? false
  const [newTime, setNewTime] = useState('')
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const addItem = () => {
    if (!newTime || !newLabel.trim()) return
    const item: TimelineItem = { id: Date.now().toString(), time: newTime, label: newLabel.trim() }
    updateWidgetData(widget.id, { timeline: [...timeline, item].sort((a, b) => a.time.localeCompare(b.time)) })
    setNewTime(''); setNewLabel('')
  }
  const removeItem = (id: string) =>
    updateWidgetData(widget.id, { timeline: timeline.filter((i: TimelineItem) => i.id !== id) })

  const timeStr = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <WidgetWrapper widget={widget} minWidth={200} minHeight={200} title="Klokke">
      <div className="flex flex-col h-full bg-gradient-to-b from-blue-950/60 to-black/40">
        {/* Tab toggle */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => updateWidgetData(widget.id, { showTimeline: false })}
            className={`flex-1 py-1.5 text-xs transition-colors ${!showTimeline ? 'text-white bg-white/10' : 'text-white/40 hover:text-white/70'}`}
          >
            <Clock size={12} className="inline mr-1" />Klokke
          </button>
          <button
            onClick={() => updateWidgetData(widget.id, { showTimeline: true })}
            className={`flex-1 py-1.5 text-xs transition-colors ${showTimeline ? 'text-white bg-white/10' : 'text-white/40 hover:text-white/70'}`}
          >
            📋 Timeplan
          </button>
        </div>

        {!showTimeline ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
            <AnalogClock size={Math.min(widget.width, widget.height) * 0.55} />
            <div className="text-center">
              <div className="text-white text-3xl font-mono font-bold tracking-wider">{timeStr}</div>
              <div className="text-white/50 text-sm capitalize mt-1">{dateStr}</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
            {/* Add item */}
            <div className="flex gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-white/10 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-blue-400 w-24"
              />
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                placeholder="Aktivitet..."
                className="flex-1 bg-white/10 text-white text-xs rounded px-2 py-1.5 border border-white/10 outline-none focus:border-blue-400 placeholder-white/30"
              />
              <button
                onClick={addItem}
                className="bg-blue-500/60 hover:bg-blue-500 text-white rounded px-2 py-1.5 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            {/* Items */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
              {timeline.length === 0 && (
                <div className="text-white/30 text-xs text-center mt-4">Ingen aktiviteter ennå</div>
              )}
              {timeline.map((item: TimelineItem) => {
                const [hh, mm] = item.time.split(':').map(Number)
                const itemDate = new Date(); itemDate.setHours(hh, mm, 0)
                const isPast = now > itemDate
                const isCurrent = Math.abs(now.getTime() - itemDate.getTime()) < 15 * 60 * 1000 && !isPast
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                      isCurrent ? 'bg-blue-500/30 border border-blue-400/50' :
                      isPast ? 'opacity-40' : 'bg-white/5'
                    }`}
                  >
                    <span className="text-blue-300 font-mono text-xs w-12 shrink-0">{item.time}</span>
                    <span className={`flex-1 text-sm ${isCurrent ? 'text-white font-semibold' : 'text-white/70'}`}>
                      {isCurrent && '▶ '}{item.label}
                    </span>
                    <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </WidgetWrapper>
  )
}
