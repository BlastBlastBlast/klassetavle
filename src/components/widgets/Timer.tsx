import { useEffect, useRef, useState } from 'react'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import type { Widget } from '../../store/boardStore'
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react'

function playDoneSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const notes = [523, 659, 784, 1047] // C E G C
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = 'sine'
    const t = ctx.currentTime + i * 0.18
    gain.gain.setValueAtTime(0.4, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    osc.start(t)
    osc.stop(t + 0.4)
  })
}

function playTickSound() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 880
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.05)
}

const PRESETS = [1, 2, 3, 5, 10, 15, 20, 30]

export function Timer({ widget }: { widget: Widget }) {
  const [total, setTotal] = useState(300) // seconds
  const [remaining, setRemaining] = useState(300)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTickRef = useRef<number>(0)

  useEffect(() => {
    if (running && !done) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false)
            setDone(true)
            playDoneSound()
            return 0
          }
          const now = Math.floor(r - 1)
          if (now <= 10 && now !== lastTickRef.current) {
            lastTickRef.current = now
            playTickSound()
          }
          return r - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, done])

  const reset = (seconds?: number) => {
    const t = seconds ?? total
    setTotal(t); setRemaining(t); setRunning(false); setDone(false); lastTickRef.current = 0
  }

  const adjust = (delta: number) => {
    if (running) return
    const newTotal = Math.max(10, total + delta)
    reset(newTotal)
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progress = total > 0 ? remaining / total : 0
  const circumference = 2 * Math.PI * 80
  const isLow = remaining <= 30 && remaining > 0

  return (
    <WidgetWrapper widget={widget} minWidth={200} minHeight={180} title="Timer">
      <div className={`flex flex-col items-center justify-center gap-3 h-full p-4 transition-all ${done ? 'animate-timer-done' : ''}`}>
        {/* Circular progress */}
        <div className="relative">
          <svg width={180} height={180} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={90} cy={90} r={80} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
            <circle
              cx={90} cy={90} r={80}
              fill="none"
              stroke={done ? '#ef4444' : isLow ? '#f97316' : '#60a5fa'}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-mono font-bold text-white ${isLow && running ? 'animate-timer-pulse' : ''}`}
              style={{ fontSize: 'clamp(24px, 5vw, 40px)' }}
            >
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            {done && <span className="text-red-400 text-sm font-bold mt-1">Tid ute! ⏰</span>}
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1 justify-center">
          {PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => reset(m * 60)}
              className="text-xs px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
            >
              {m}m
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={() => adjust(-60)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors" title="-1 min">
            <Minus size={14} />
          </button>
          <button
            onClick={() => { if (done) { reset(); return } setRunning((r) => !r) }}
            className={`p-3 rounded-full transition-all ${running ? 'bg-orange-500/80 hover:bg-orange-500' : 'bg-blue-500/80 hover:bg-blue-500'} text-white`}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => reset()} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors">
            <RotateCcw size={14} />
          </button>
          <button onClick={() => adjust(60)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors" title="+1 min">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </WidgetWrapper>
  )
}
