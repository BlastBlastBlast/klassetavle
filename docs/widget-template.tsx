/**
 * WIDGET TEMPLATE — KlasseTavle
 *
 * Instructions for AI agents:
 * 1. Copy this file to src/components/widgets/MinNavn.tsx
 * 2. Replace ALL occurrences of 'MinNavn' with your PascalCase widget name
 * 3. Replace ALL occurrences of 'minnavn' with your lowercase WidgetType string
 * 4. Define MyData to match your widget's internal state
 * 5. Build your UI inside WidgetWrapper
 * 6. Complete the 5-step checklist in CONTRIBUTING.md §6
 *
 * DO NOT:
 * - Use useState for data that should persist between sessions
 * - Add position/transform CSS to the root element
 * - Write any UI text in English
 */

import { useBoardStore } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import type { Widget } from '../../store/boardStore'

// Define the shape of your widget's internal state.
// All fields are stored inside widget.data in the Zustand store.
interface MyData {
  exampleText: string
  exampleCount: number
  // Add your fields here
}

// Default values used when widget.data fields are missing (new widget or migration)
const DEFAULTS: MyData = {
  exampleText: 'Hei verden',
  exampleCount: 0,
}

// Helper to read typed data from widget.data (handles missing fields safely)
function getData(widget: Widget): MyData {
  return {
    exampleText: (widget.data.exampleText as string) ?? DEFAULTS.exampleText,
    exampleCount: (widget.data.exampleCount as number) ?? DEFAULTS.exampleCount,
  }
}

interface Props {
  widget: Widget
}

export function MinNavn({ widget }: Props) {
  const { updateWidgetData } = useBoardStore()
  const data = getData(widget)

  // Example: update a single field
  function handleTextChange(newText: string) {
    updateWidgetData(widget.id, { exampleText: newText })
  }

  // Example: update a counter
  function increment() {
    updateWidgetData(widget.id, { exampleCount: data.exampleCount + 1 })
  }

  return (
    <WidgetWrapper
      widget={widget}
      title="Min Widget"   // Norwegian title shown in drag handle header
      minWidth={200}        // Minimum resize width in px
      minHeight={150}       // Minimum resize height in px
    >
      {/* Root: flex column, full height, padding */}
      <div className="flex flex-col h-full p-3 gap-3 text-white">

        {/* Optional: controls row at top */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={increment}
            className="rounded-lg px-3 py-1.5 text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors"
          >
            Legg til
          </button>
          <span className="text-sm opacity-70">
            Antall: {data.exampleCount}
          </span>
        </div>

        {/* Main content area — fills remaining space */}
        <div className="flex-1 flex items-center justify-center">
          <input
            type="text"
            value={data.exampleText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="bg-white/10 rounded-lg px-3 py-2 text-center text-lg w-full outline-none focus:ring-2 focus:ring-white/40"
            placeholder="Skriv noe..."
          />
        </div>

      </div>
    </WidgetWrapper>
  )
}
