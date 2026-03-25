import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'

type LightColor = 'red' | 'yellow' | 'green' | null

export function Trafikklys({ widget }: { widget: Widget }) {
  const { updateWidgetData } = useBoardStore()
  const active = (widget.data.active as LightColor) ?? null

  const set = (color: LightColor) =>
    updateWidgetData(widget.id, { active: active === color ? null : color })

  const lights: { color: LightColor; on: string; off: string; pulse: string; label: string }[] = [
    { color: 'red', on: '#ef4444', off: '#3f1010', pulse: 'animate-pulse-red', label: 'Stopp' },
    { color: 'yellow', on: '#eab308', off: '#3d3000', pulse: 'animate-pulse-yellow', label: 'Klar' },
    { color: 'green', on: '#22c55e', off: '#0a2e15', pulse: 'animate-pulse-green', label: 'Gå' },
  ]

  return (
    <WidgetWrapper widget={widget} minWidth={100} minHeight={240} title="Trafikklys">
      <div className="flex flex-col items-center justify-center gap-4 h-full bg-gray-900/80 py-4">
        {lights.map(({ color, on, off, pulse, label }) => {
          const isOn = active === color
          return (
            <button
              key={color}
              onClick={() => set(color)}
              title={label}
              className={`rounded-full transition-all duration-300 active:scale-95 cursor-pointer border-4 ${
                isOn ? 'border-white/30 ' + pulse : 'border-transparent'
              }`}
              style={{
                width: '60%',
                aspectRatio: '1',
                backgroundColor: isOn ? on : off,
                boxShadow: isOn ? `0 0 30px ${on}, 0 0 60px ${on}55` : 'inset 0 2px 8px rgba(0,0,0,0.5)',
              }}
            />
          )
        })}
        <p className="text-white/40 text-xs mt-1">
          {active === 'red' ? 'Stopp' : active === 'yellow' ? 'Klar' : active === 'green' ? 'Gå!' : 'Klikk for å velge'}
        </p>
      </div>
    </WidgetWrapper>
  )
}
