import { useBoardStore } from '../../store/boardStore'
import { Toolbar } from './Toolbar'
import { AuthBar } from './AuthBar'
import { WidgetRenderer } from './WidgetRenderer'
import { GestureAmbient } from './GestureAmbient'
import { GestureOverlay } from './GestureOverlay'
import { CanvasNavigator } from './CanvasNavigator'
import { Timeline } from '../timeline/Timeline'
import { TimelineControls } from '../timeline/TimelineControls'

export function Board() {
  const { widgets, background } = useBoardStore()

  // When the user hasn't set a custom background, fall back to the themed canvas colour
  const effectiveBg = background === '#FFF8ED' ? 'var(--canvas-bg)' : background

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: effectiveBg }}
    >
      {/* Dot-grid paper texture — always present, very subtle */}
      <div
        className="absolute inset-0 pointer-events-none canvas-grid"
        style={{ opacity: 0.45, zIndex: 0 }}
      />

      {/* ① Gesture ambient — behind all widgets (z-index: 1) */}
      <GestureAmbient />

      {/* ② Widgets (z-index from store, start at 2+) */}
      {widgets.map((widget) => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}

      {/* ③ Gesture entry overlay — above widgets (z-500), auto-fades */}
      <GestureOverlay />

      {/* ④ UI chrome */}
      <Toolbar />
      <AuthBar />
      <CanvasNavigator />

      {/* ⑤ Timeline — full-width top bar + detached controls pill */}
      <Timeline />
      <TimelineControls />
    </div>
  )
}
