import { useBoardStore } from '../../store/boardStore'
import { Toolbar } from './Toolbar'
import { AuthBar } from './AuthBar'
import { WidgetRenderer } from './WidgetRenderer'
import { GestureAmbient } from './GestureAmbient'
import { GestureOverlay } from './GestureOverlay'
import { CanvasNavigator } from './CanvasNavigator'

export function Board() {
  const { widgets, background } = useBoardStore()

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background }}
    >
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
    </div>
  )
}
