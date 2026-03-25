import { useState } from 'react'
import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'

const FONT_SIZES = [14, 18, 24, 32, 48, 64]
const COLORS = ['#ffffff', '#fbbf24', '#34d399', '#60a5fa', '#f87171', '#c084fc', '#fb923c', '#000000']

export function Tekst({ widget }: { widget: Widget }) {
  const { updateWidgetData } = useBoardStore()
  const text = (widget.data.text as string) ?? ''
  const fontSize = (widget.data.fontSize as number) ?? 24
  const color = (widget.data.color as string) ?? '#ffffff'
  const align = (widget.data.align as string) ?? 'center'
  const bold = (widget.data.bold as boolean) ?? false
  const [editing, setEditing] = useState(!text)

  return (
    <WidgetWrapper widget={widget} minWidth={160} minHeight={80} title="Tekst">
      <div className="flex flex-col h-full bg-white/5">
        {/* Controls */}
        <div className="flex items-center gap-2 px-2 py-1.5 bg-black/20 border-b border-white/10 flex-wrap">
          <select
            value={fontSize}
            onChange={(e) => updateWidgetData(widget.id, { fontSize: Number(e.target.value) })}
            className="bg-white/10 text-white text-xs rounded px-1 py-0.5 border border-white/10"
          >
            {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
          </select>
          <button
            onClick={() => updateWidgetData(widget.id, { bold: !bold })}
            className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${bold ? 'bg-white/30 text-white' : 'text-white/50 hover:bg-white/10'}`}
          >
            B
          </button>
          {['left', 'center', 'right'].map((a) => (
            <button
              key={a}
              onClick={() => updateWidgetData(widget.id, { align: a })}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${align === a ? 'bg-white/30' : 'text-white/50 hover:bg-white/10'}`}
            >
              {a === 'left' ? '⬅' : a === 'center' ? '⬛' : '➡'}
            </button>
          ))}
          <div className="flex gap-1 ml-auto">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => updateWidgetData(widget.id, { color: c })}
                className={`w-4 h-4 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Text area */}
        <div
          className="flex-1 relative cursor-text"
          onClick={() => setEditing(true)}
        >
          {editing ? (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => updateWidgetData(widget.id, { text: e.target.value })}
              onBlur={() => setEditing(false)}
              placeholder="Skriv her..."
              className="w-full h-full resize-none bg-transparent p-3 outline-none placeholder-white/30"
              style={{ fontSize, color, textAlign: align as 'left' | 'center' | 'right', fontWeight: bold ? 700 : 400 }}
            />
          ) : (
            <div
              className="w-full h-full p-3 whitespace-pre-wrap break-words overflow-auto select-none"
              style={{ fontSize, color, textAlign: align as 'left' | 'center' | 'right', fontWeight: bold ? 700 : 400 }}
            >
              {text || <span className="text-white/20 italic">Klikk for å skrive...</span>}
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  )
}
