import React, { useRef, useCallback } from 'react'
import { ResizableBox } from 'react-resizable'
import { X, GripHorizontal } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'

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
  const posRef     = useRef({ x: widget.x, y: widget.y })

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
      style={{ position: 'absolute', left: widget.x, top: widget.y, zIndex: widget.zIndex }}
      className="animate-float-in widget-container"
    >
      <ResizableBox
        width={widget.width}
        height={widget.height}
        minConstraints={[minWidth, minHeight]}
        maxConstraints={[1800, 1000]}
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
