import { useState } from 'react'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import type { Widget } from '../../store/boardStore'

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
}

export function Terning({ widget }: { widget: Widget }) {
  const [value, setValue] = useState(1)
  const [rolling, setRolling] = useState(false)
  const [sides, setSides] = useState(6)

  const roll = () => {
    if (rolling) return
    setRolling(true)
    let count = 0
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * sides) + 1)
      count++
      if (count >= 12) {
        clearInterval(interval)
        setValue(Math.floor(Math.random() * sides) + 1)
        setRolling(false)
      }
    }, 60)
  }

  const dots = DOT_POSITIONS[Math.min(value, 6)] ?? DOT_POSITIONS[6]

  return (
    <WidgetWrapper widget={widget} minWidth={150} minHeight={150} title="Terning">
      <div className="flex flex-col items-center justify-center gap-4 h-full bg-gradient-to-b from-purple-950/60 to-black/40 p-4">
        {/* Sides selector */}
        <div className="flex gap-1">
          {[4, 6, 8, 10, 12, 20].map((n) => (
            <button
              key={n}
              onClick={() => { setSides(n); setValue(1) }}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${sides === n ? 'bg-purple-500 text-white' : 'text-white/40 hover:bg-white/10'}`}
            >
              d{n}
            </button>
          ))}
        </div>

        {/* Dice */}
        <button
          onClick={roll}
          className={`relative cursor-pointer active:scale-90 transition-transform ${rolling ? 'animate-dice-shake' : 'hover:scale-105'}`}
          style={{ width: '60%', aspectRatio: '1' }}
          title="Kast terningen!"
        >
          <div
            className="w-full h-full rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #f0f0f0, #d0d0d0)',
              boxShadow: rolling
                ? '0 0 30px rgba(168,85,247,0.8), 6px 6px 0 rgba(0,0,0,0.4)'
                : '6px 6px 0 rgba(0,0,0,0.4), inset 2px 2px 4px rgba(255,255,255,0.5)',
            }}
          >
            {sides === 6 ? (
              <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
                {dots.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={8} fill="#1a1a2e" />
                ))}
              </svg>
            ) : (
              <span className="text-gray-800 font-black" style={{ fontSize: 'clamp(24px, 8vw, 56px)' }}>
                {value}
              </span>
            )}
          </div>
        </button>

        <div className="text-center">
          <div className="text-white text-2xl font-bold">{value}</div>
          <div className="text-white/40 text-xs">
            {rolling ? 'Kaster...' : 'Trykk for å kaste!'}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  )
}
