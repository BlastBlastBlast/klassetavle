import { useBoardStore } from '../../store/boardStore'
import { Toolbar } from './Toolbar'
import { AuthBar } from './AuthBar'
import { WidgetRenderer } from './WidgetRenderer'

export function Board() {
  const { widgets, background } = useBoardStore()

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background }}
    >
      {widgets.map((widget) => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}
      <Toolbar />
      <AuthBar />
    </div>
  )
}
