import { useState, useEffect } from 'react'
import { useBoardStore } from '../../store/boardStore'
import { GESTURES } from '../../lib/gestures'

/**
 * Entry-only overlay — dramatic announcement, then auto-fades out.
 * No button, no interaction. The ambient background layer (GestureAmbient)
 * takes over once this disappears.
 */
export function GestureOverlay() {
  const { globalGestureId } = useBoardStore()
  const [displayId, setDisplayId] = useState<string | null>(null)
  const [phase, setPhase] = useState<'hidden' | 'entry' | 'fading'>('hidden')

  useEffect(() => {
    if (!globalGestureId) return

    // New gesture — restart entry animation
    setDisplayId(globalGestureId)
    setPhase('entry')

    const fadeStart = setTimeout(() => setPhase('fading'), 2800)
    const hide     = setTimeout(() => { setPhase('hidden'); setDisplayId(null) }, 4400)

    return () => { clearTimeout(fadeStart); clearTimeout(hide) }
  }, [globalGestureId])

  const gesture = GESTURES.find((g) => g.id === displayId)
  if (phase === 'hidden' || !gesture) return null

  return (
    <div
      className="fixed inset-0 z-[500] pointer-events-none flex flex-col items-center justify-center gap-4"
      style={{
        backdropFilter: 'blur(26px) saturate(130%)',
        WebkitBackdropFilter: 'blur(26px)',
        background: 'rgba(0,0,0,0.80)',
        boxShadow: `inset 0 0 200px ${gesture.color}44`,
        opacity: phase === 'fading' ? 0 : 1,
        transition: phase === 'fading' ? 'opacity 1.6s ease' : 'none',
      }}
    >
      {/* Emoji */}
      <div
        className="animate-bounce-in"
        style={{
          fontSize: '10rem',
          lineHeight: 1,
          filter: `drop-shadow(0 0 60px ${gesture.color}aa)`,
          userSelect: 'none',
        }}
      >
        {gesture.emoji}
      </div>

      {/* Text */}
      <div
        className="animate-float-in text-center"
        style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
      >
        <div
          style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: 'white',
            textShadow: `0 0 40px ${gesture.color}cc, 0 2px 12px rgba(0,0,0,0.6)`,
            lineHeight: 1.2,
          }}
        >
          {gesture.label}
        </div>
        <div
          style={{
            marginTop: '0.6rem',
            fontSize: '1.5rem',
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          {gesture.sublabel}
        </div>
      </div>
    </div>
  )
}
