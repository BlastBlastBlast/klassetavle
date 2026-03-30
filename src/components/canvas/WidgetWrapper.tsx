import React, { useRef, useCallback, useEffect, useState } from 'react'
import { ResizableBox } from 'react-resizable'
import { X, GripHorizontal } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'

// Approximate layout constants so widgets don't spawn under chrome
const DOCK_W    = 88  // toolbar width (open)
const TIMELINE_H = 48  // timeline bar + gap
const NAV_H     = 72  // canvas navigator pill + margin

interface Props {
  widget: Widget
  children: React.ReactNode
  minWidth?: number
  minHeight?: number
  title?: string
  accentColor?: string
}

export function WidgetWrapper({
  widget,
  children,
  minWidth = 120,
  minHeight = 80,
  title,
  accentColor = '#7C3AED',
}: Props) {
  const { updateWidget, removeWidget, bringToFront } = useBoardStore()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Track viewport size reactively so clamps stay correct after resize
  const [vw, setVw] = useState(() => window.innerWidth)
  const [vh, setVh] = useState(() => window.innerHeight)
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Clamp the stored position + size to what's actually visible
  const maxW = Math.max(minWidth,  vw - DOCK_W - 8)
  const maxH = Math.max(minHeight, vh - TIMELINE_H - NAV_H - 8)

  const clampedW = Math.min(widget.width,  maxW)
  const clampedH = Math.min(widget.height, maxH)
  const clampedX = Math.max(DOCK_W, Math.min(widget.x, vw - clampedW - 4))
  const clampedY = Math.max(TIMELINE_H + 4, Math.min(widget.y, vh - clampedH - NAV_H - 4))

  const posRef = useRef({ x: clampedX, y: clampedY })

  // Keep posRef in sync when clamping changes (e.g. on resize or store update)
  useEffect(() => {
    posRef.current = { x: clampedX, y: clampedY }
    if (wrapperRef.current) {
      wrapperRef.current.style.left = clampedX + 'px'
      wrapperRef.current.style.top  = clampedY + 'px'
    }
  }, [clampedX, clampedY])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    bringToFront(widget.id)

    const startMouseX = e.clientX
    const startMouseY = e.clientY
    const startX = posRef.current.x
    const startY = posRef.current.y

    const onMove = (ev: PointerEvent) => {
      const newX = startX + ev.clientX - startMouseX
      const newY = startY + ev.clientY - startMouseY
      posRef.current = { x: newX, y: newY }
      if (wrapperRef.current) {
        wrapperRef.current.style.left = newX + 'px'
        wrapperRef.current.style.top  = newY + 'px'
      }
    }

    const onUp = () => {
      updateWidget(widget.id, { x: posRef.current.x, y: posRef.current.y })
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [widget.id, bringToFront, updateWidget])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'absolute', left: clampedX, top: clampedY, zIndex: widget.zIndex }}
      className="animate-float-in widget-container"
    >
      <ResizableBox
        width={clampedW}
        height={clampedH}
        minConstraints={[minWidth, minHeight]}
        maxConstraints={[maxW, maxH]}
        resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
        onResizeStop={(_e, data) =>
          updateWidget(widget.id, { width: data.size.width, height: data.size.height })
        }
      >
        {/* ── Card shell ───────────────────────────────────────────────────── */}
        <div
          className="relative flex flex-col w-full h-full"
          style={{
            background: 'var(--panel-bg)',
            border: '2.5px solid var(--panel-border)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
          }}
        >
          {/* Coloured accent bar at top */}
          <div style={{ height: 4, background: accentColor, flexShrink: 0 }} />

          {/* Drag handle row */}
          <div
            className="widget-drag-handle flex items-center justify-between px-3 py-1.5 select-none shrink-0"
            style={{
              cursor: 'grab',
              touchAction: 'none',
              background: 'var(--panel-bg-alt)',
              borderBottom: '1.5px solid var(--panel-border)',
            }}
            onPointerDown={onPointerDown}
          >
            <div className="flex items-center gap-1.5">
              <GripHorizontal size={13} style={{ color: 'var(--ink-muted)' }} />
              {title && (
                <span
                  className="font-bold leading-none"
                  style={{ fontSize: 11, color: accentColor, fontFamily: 'Fredoka, Nunito, sans-serif' }}
                >
                  {title}
                </span>
              )}
            </div>

            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => removeWidget(widget.id)}
              className="flex items-center justify-center rounded-full transition-all"
              style={{
                width: 20,
                height: 20,
                color: 'var(--ink-muted)',
                border: '1.5px solid var(--panel-border)',
                background: 'var(--panel-bg)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.color = '#F03E3E'
                el.style.borderColor = '#F03E3E'
                el.style.background = '#FFF0F0'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.color = 'var(--ink-muted)'
                el.style.borderColor = 'var(--panel-border)'
                el.style.background = 'var(--panel-bg)'
              }}
            >
              <X size={11} />
            </button>
          </div>

          {/* Widget content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </ResizableBox>
    </div>
  )
}
