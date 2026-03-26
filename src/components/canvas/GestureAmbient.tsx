import { useState, useEffect } from 'react'
import { useBoardStore } from '../../store/boardStore'
import { GESTURES } from '../../lib/gestures'

/**
 * Persistent ambient background layer — sits behind all widgets (z-index: 1).
 * Shows a subtle coloured tint + large faded emoji watermark.
 * Fades in immediately when a gesture is set, and fades out when cleared.
 * No interaction, no blocking.
 */
export function GestureAmbient() {
  const { globalGestureId } = useBoardStore()
  const [displayId, setDisplayId]   = useState<string | null>(null)
  const [visible,   setVisible]     = useState(false)

  useEffect(() => {
    if (globalGestureId) {
      setDisplayId(globalGestureId)
      setVisible(true)
    } else {
      setVisible(false)
      // Keep displayId alive until fade-out completes so the colour stays visible
      const t = setTimeout(() => setDisplayId(null), 800)
      return () => clearTimeout(t)
    }
  }, [globalGestureId])

  const gesture = GESTURES.find((g) => g.id === displayId)
  if (!gesture) return null

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 1,                               // behind widgets (z ≥ 2)
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.9s ease',
      }}
    >
      {/* Colour wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${gesture.color}22 0%, ${gesture.color}0a 70%, transparent 100%)`,
          transition: 'background 0.9s ease',
        }}
      />

      {/* Large faded emoji watermark — centered */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '38rem',
          lineHeight: 1,
          opacity: 0.035,
          userSelect: 'none',
          filter: 'blur(6px)',
          transition: 'opacity 0.9s ease',
        }}
        aria-hidden="true"
      >
        {gesture.emoji}
      </div>
    </div>
  )
}
