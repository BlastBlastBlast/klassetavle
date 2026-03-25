import { useCallback, useRef, useState } from 'react'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import type { Widget } from '../../store/boardStore'
import { Eraser, Trash2, Plus, Layers, Download } from 'lucide-react'

const PALETTE = [
  // Row 1 - whites/grays/blacks
  '#ffffff','#d1d5db','#9ca3af','#6b7280','#374151','#1f2937','#111827','#000000',
  // Row 2 - reds/pinks
  '#fef2f2','#fecaca','#f87171','#ef4444','#dc2626','#b91c1c','#991b1b','#7f1d1d',
  // Row 3 - oranges
  '#fff7ed','#fed7aa','#fb923c','#f97316','#ea580c','#c2410c','#9a3412','#7c2d12',
  // Row 4 - yellows
  '#fefce8','#fef08a','#facc15','#eab308','#ca8a04','#a16207','#854d0e','#713f12',
  // Row 5 - greens
  '#f0fdf4','#bbf7d0','#4ade80','#22c55e','#16a34a','#15803d','#166534','#14532d',
  // Row 6 - blues
  '#eff6ff','#bfdbfe','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#1e40af','#1e3a8a',
  // Row 7 - purples
  '#faf5ff','#e9d5ff','#c084fc','#a855f7','#9333ea','#7c3aed','#6d28d9','#4c1d95',
  // Row 8 - pinks/special
  '#fdf2f8','#fbcfe8','#f472b6','#ec4899','#db2777','#be185d','#9d174d','#831843',
]

const BRUSH_SIZES = [2, 4, 8, 12, 20, 32]

interface Layer { id: string; name: string; visible: boolean; opacity: number; dataUrl: string | null }

const newLayer = (name: string): Layer => ({
  id: Date.now().toString(), name, visible: true, opacity: 1, dataUrl: null
})

export function Tegning({ widget }: { widget: Widget }) {
  const [layers, setLayers] = useState<Layer[]>([newLayer('Lag 1')])
  const [activeLayerIdx, setActiveLayerIdx] = useState(0)
  const [color, setColor] = useState('#ffffff')
  const [brushSize, setBrushSize] = useState(4)
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [showLayers, setShowLayers] = useState(false)
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({})
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const getCtx = (layerId: string) => {
    const canvas = canvasRefs.current[layerId]
    return canvas?.getContext('2d') ?? null
  }

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const layer = layers[activeLayerIdx]
    if (!layer) return
    const canvas = canvasRefs.current[layer.id]
    if (!canvas) return
    drawing.current = true
    const pos = getPos(e, canvas)
    lastPos.current = pos

    const ctx = getCtx(layer.id)
    if (!ctx) return
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.globalAlpha = layer.opacity
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
  }, [layers, activeLayerIdx, color, brushSize, tool])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return
    const layer = layers[activeLayerIdx]
    if (!layer) return
    const canvas = canvasRefs.current[layer.id]
    if (!canvas) return
    const ctx = getCtx(layer.id)
    if (!ctx || !lastPos.current) return

    const pos = getPos(e, canvas)
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    ctx.globalAlpha = layer.opacity
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }, [layers, activeLayerIdx, color, brushSize, tool])

  const stopDraw = () => { drawing.current = false; lastPos.current = null }

  const clearLayer = (layerId: string) => {
    const canvas = canvasRefs.current[layerId]
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const addLayer = () => {
    const newL = newLayer(`Lag ${layers.length + 1}`)
    setLayers((ls) => [...ls, newL])
    setActiveLayerIdx(layers.length)
  }

  const toggleLayerVisibility = (id: string) =>
    setLayers((ls) => ls.map((l) => l.id === id ? { ...l, visible: !l.visible } : l))

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return
    setLayers((ls) => ls.filter((l) => l.id !== id))
    setActiveLayerIdx(0)
  }

  const download = () => {
    const composite = document.createElement('canvas')
    composite.width = 800; composite.height = 600
    const ctx = composite.getContext('2d')!
    ctx.fillStyle = 'transparent'
    layers.forEach((layer) => {
      if (!layer.visible) return
      const canvas = canvasRefs.current[layer.id]
      if (canvas) { ctx.globalAlpha = layer.opacity; ctx.drawImage(canvas, 0, 0) }
    })
    const a = document.createElement('a')
    a.download = 'tegning.png'; a.href = composite.toDataURL()
    a.click()
  }

  const activeLayer = layers[activeLayerIdx]

  return (
    <WidgetWrapper widget={widget} minWidth={320} minHeight={280} title="Tegning">
      <div className="flex flex-col h-full bg-gray-900">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-2 py-1.5 bg-black/30 border-b border-white/10 flex-wrap shrink-0">
          {/* Tool buttons */}
          <button
            onClick={() => setTool('brush')}
            className={`px-2 py-1 rounded text-xs transition-colors ${tool === 'brush' ? 'bg-blue-500 text-white' : 'text-white/50 hover:bg-white/10'}`}
          >
            🖌 Pensel
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${tool === 'eraser' ? 'bg-orange-500 text-white' : 'text-white/50 hover:bg-white/10'}`}
          >
            <Eraser size={12} /> Viskelær
          </button>

          {/* Brush sizes */}
          <div className="flex items-center gap-1">
            {BRUSH_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className={`rounded-full flex items-center justify-center transition-all ${brushSize === s ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                style={{ width: 24, height: 24, backgroundColor: color }}
                title={`${s}px`}
              >
                <div className="rounded-full bg-current" style={{ width: Math.min(s, 20), height: Math.min(s, 20), backgroundColor: tool === 'brush' ? color : 'white' }} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setShowLayers((v) => !v)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${showLayers ? 'bg-purple-500 text-white' : 'text-white/50 hover:bg-white/10'}`}
            >
              <Layers size={12} /> Lag
            </button>
            <button onClick={() => clearLayer(activeLayer?.id)} className="text-white/40 hover:text-red-400 transition-colors p-1 rounded hover:bg-white/10">
              <Trash2 size={14} />
            </button>
            <button onClick={download} className="text-white/40 hover:text-green-400 transition-colors p-1 rounded hover:bg-white/10">
              <Download size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Color palette */}
          <div className="flex flex-col shrink-0 p-1 gap-0.5 bg-black/20 border-r border-white/10 overflow-y-auto" style={{ width: 76 }}>
            <div
              className="w-8 h-8 rounded border-2 border-white/50 mb-1 cursor-pointer mx-auto"
              style={{ backgroundColor: color }}
              title="Nåværende farge"
            />
            <div className="grid grid-cols-2 gap-0.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setTool('brush') }}
                  className={`w-7 h-7 rounded transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Canvas area */}
          <div className="flex-1 relative overflow-hidden bg-white cursor-crosshair">
            {layers.map((layer, i) => (
              <canvas
                key={layer.id}
                ref={(el) => { canvasRefs.current[layer.id] = el }}
                width={800}
                height={600}
                className="absolute inset-0 w-full h-full"
                style={{
                  zIndex: i + 1,
                  opacity: layer.visible ? layer.opacity : 0,
                  pointerEvents: i === activeLayerIdx ? 'auto' : 'none',
                }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            ))}
          </div>

          {/* Layers panel */}
          {showLayers && (
            <div className="flex flex-col shrink-0 bg-black/40 border-l border-white/10 overflow-y-auto" style={{ width: 120 }}>
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/10">
                <span className="text-white/60 text-xs">Lag</span>
                <button onClick={addLayer} className="text-white/50 hover:text-green-400 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              {[...layers].reverse().map((layer, ri) => {
                const i = layers.length - 1 - ri
                return (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayerIdx(i)}
                    className={`flex items-center gap-1 px-2 py-2 cursor-pointer transition-colors ${i === activeLayerIdx ? 'bg-blue-500/30 border-l-2 border-blue-400' : 'hover:bg-white/5'}`}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id) }}
                      className="text-white/50 hover:text-white shrink-0"
                    >
                      {layer.visible ? '👁' : '🙈'}
                    </button>
                    <span className="text-white/70 text-xs truncate flex-1">{layer.name}</span>
                    {layers.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeLayer(layer.id) }}
                        className="text-white/20 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  )
}
