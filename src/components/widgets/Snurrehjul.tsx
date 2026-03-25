import { useRef, useState } from 'react'
import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import { Plus, Trash2 } from 'lucide-react'

const WHEEL_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#14b8a6','#f59e0b','#10b981','#6366f1',
]

function Confetti({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length],
            animation: `confetti-fall ${0.8 + Math.random() * 0.8}s ease-out ${Math.random() * 0.5}s forwards`,
          }}
        />
      ))}
    </div>
  )
}

export function Snurrehjul({ widget }: { widget: Widget }) {
  const { updateWidgetData } = useBoardStore()
  const items: string[] = (widget.data.items as string[]) ?? ['Gruppe 1', 'Gruppe 2', 'Gruppe 3', 'Gruppe 4']
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [newItem, setNewItem] = useState('')
  const animRef = useRef<number>(0)

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return
    const ctx = canvas.getContext('2d')!
    const { width: w, height: h } = canvas
    const cx = w / 2, cy = h / 2
    const r = Math.min(cx, cy) - 8
    const slice = (2 * Math.PI) / items.length

    ctx.clearRect(0, 0, w, h)

    items.forEach((item, i) => {
      const start = rot + i * slice
      const end = start + slice

      // Slice
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + slice / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${Math.min(14, r / items.length * 1.2)}px system-ui`
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 3
      const text = item.length > 12 ? item.slice(0, 11) + '…' : item
      ctx.fillText(text, r - 12, 5)
      ctx.restore()
    })

    // Center hub
    ctx.beginPath()
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI)
    ctx.fillStyle = '#1a1a2e'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Pointer (top)
    ctx.beginPath()
    ctx.moveTo(cx - 12, 4)
    ctx.lineTo(cx + 12, 4)
    ctx.lineTo(cx, 30)
    ctx.closePath()
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 8
  }

  const spin = () => {
    if (spinning || items.length < 2) return
    setResult(null)
    setShowConfetti(false)
    setSpinning(true)

    const totalSpin = 5 * 2 * Math.PI + Math.random() * 6 * Math.PI
    const duration = 4000
    const start = performance.now()
    const startRot = rotation

    const animate = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const currentRot = startRot + totalSpin * eased

      drawWheel(currentRot)

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setRotation(currentRot)
        setSpinning(false)

        // Find winner
        const slice = (2 * Math.PI) / items.length
        const normalised = ((currentRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        // Pointer is at top (π*1.5), find which slice it lands in
        const pointer = (2 * Math.PI - normalised + Math.PI * 1.5) % (2 * Math.PI)
        const idx = Math.floor(pointer / slice) % items.length
        setResult(items[idx])
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2500)
      }
    }
    animRef.current = requestAnimationFrame(animate)
  }

  // Initial draw
  const onCanvasMount = (el: HTMLCanvasElement | null) => {
    if (el) {
      (canvasRef as any).current = el
      drawWheel(rotation)
    }
  }

  const addItem = () => {
    if (!newItem.trim()) return
    updateWidgetData(widget.id, { items: [...items, newItem.trim()] })
    setNewItem('')
  }
  const removeItem = (i: number) =>
    updateWidgetData(widget.id, { items: items.filter((_, idx) => idx !== i) })

  const canvasSize = Math.min(widget.width - 16, widget.height - 130)

  return (
    <WidgetWrapper widget={widget} minWidth={280} minHeight={320} title="Snurrehjul">
      <div className="flex flex-col h-full bg-gradient-to-b from-purple-950/50 to-black/40 relative overflow-hidden">
        <Confetti active={showConfetti} />

        {/* Wheel */}
        <div className="flex-1 flex items-center justify-center p-2">
          <canvas
            ref={onCanvasMount}
            width={canvasSize}
            height={canvasSize}
            onClick={spin}
            className="cursor-pointer rounded-full"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>

        {/* Result */}
        {result && (
          <div className="text-center py-2 animate-bounce-in">
            <div className="text-yellow-300 font-bold text-lg">🎉 {result}!</div>
          </div>
        )}

        {/* Spin button */}
        <div className="flex justify-center pb-2">
          <button
            onClick={spin}
            disabled={spinning || items.length < 2}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-95"
          >
            {spinning ? 'Snurrer...' : '🎡 Snurr!'}
          </button>
        </div>

        {/* Items list */}
        <div className="border-t border-white/10 p-2">
          <div className="flex gap-1 mb-1">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              placeholder="Legg til..."
              className="flex-1 bg-white/10 text-white text-xs rounded px-2 py-1 border border-white/10 outline-none focus:border-purple-400 placeholder-white/30"
            />
            <button onClick={addItem} className="bg-purple-500/60 hover:bg-purple-500 text-white rounded px-2 py-1 transition-colors">
              <Plus size={12} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-xs text-white/80">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }} />
                {item}
                <button onClick={() => removeItem(i)} className="text-white/30 hover:text-red-400 ml-0.5">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WidgetWrapper>
  )
}
