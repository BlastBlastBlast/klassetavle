import React, { useRef, useCallback } from 'react'
import { ResizableBox } from 'react-resizable'
import { X, Layers } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'

interface Props {
  widget: Widget
  children: React.ReactNode
  minWidth?: number
  minHeight?: number
  title?: string
}

export function WidgetWrapper({ widget, children, minWidth = 120, minHeight = 80, title }: Props) {
  const { updateWidget, removeWidget, bringToFront } = useBoardStore()
  const wrapperRef = useRef<HTMLDivElement>(null)
  // Track position in a ref so drag moves have zero re-renders
  const posRef = useRef({ x: widget.x, y: widget.y })

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on primary button (left click)
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
        wrapperRef.current.style.top = newY + 'px'
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
      style={{
        position: 'absolute',
        left: widget.x,
        top: widget.y,
        zIndex: widget.zIndex,
      }}
      className="animate-float-in"
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
        <div
          className="relative flex flex-col w-full h-full rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Drag handle header */}
          <div
            className="widget-drag-handle flex items-center justify-between px-3 py-2 bg-black/30 select-none shrink-0"
            style={{ cursor: 'grab', touchAction: 'none' }}
            onPointerDown={onPointerDown}
          >
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-white/50" />
              {title && <span className="text-white/70 text-xs font-medium">{title}</span>}
            </div>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => removeWidget(widget.id)}
              className="text-white/50 hover:text-white/90 transition-colors p-0.5 rounded-full hover:bg-white/10"
            >
              <X size={14} />
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
