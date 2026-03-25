import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import { useState, useRef } from 'react'

const PRESET_BACKGROUNDS = [
  { label: 'Natt', value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
  { label: 'Solnedgang', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fda085 100%)' },
  { label: 'Hav', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: 'Skog', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { label: 'Soloppgang', value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { label: 'Is', value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { label: 'Varm', value: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
  { label: 'Mint', value: 'linear-gradient(135deg, #0f9b58 0%, #00bf8f 100%)' },
  { label: 'Sort', value: '#000000' },
  { label: 'Hvit', value: '#ffffff' },
  { label: 'Blå', value: '#1e40af' },
  { label: 'Grønn', value: '#166534' },
]

export function Bakgrunn({ widget }: { widget: Widget }) {
  const { setBackground } = useBoardStore()
  const [urlInput, setUrlInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const applyImage = (src: string) =>
    setBackground(`url("${src}") center/cover no-repeat`)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => applyImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <WidgetWrapper widget={widget} minWidth={280} minHeight={300} title="Bakgrunn">
      <div className="flex flex-col gap-3 h-full bg-black/20 p-3 overflow-y-auto">
        <p className="text-white/50 text-xs">Velg bakgrunn for tavlen</p>

        {/* Preset grid */}
        <div className="grid grid-cols-3 gap-2">
          {PRESET_BACKGROUNDS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setBackground(value)}
              className="relative rounded-xl overflow-hidden aspect-video border-2 border-transparent hover:border-white/50 transition-all group"
              style={{ background: value }}
            >
              <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-semibold">{label}</span>
              </div>
              <span className="absolute bottom-1 left-0 right-0 text-center text-white/60 text-[10px]">{label}</span>
            </button>
          ))}
        </div>

        <div className="h-px bg-white/10" />

        {/* URL input */}
        <div>
          <p className="text-white/40 text-xs mb-1.5">Bakgrunnsbilde fra URL</p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyImage(urlInput)}
              placeholder="https://..."
              className="flex-1 bg-white/10 text-white text-xs rounded-lg px-2 py-1.5 border border-white/10 outline-none focus:border-blue-400 placeholder-white/30"
            />
            <button
              onClick={() => applyImage(urlInput)}
              className="bg-blue-500/60 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Bruk
            </button>
          </div>
        </div>

        {/* File upload */}
        <div>
          <p className="text-white/40 text-xs mb-1.5">Last opp bilde</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-white/20 hover:border-blue-400/50 rounded-xl py-3 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            📁 Velg fil
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Custom color */}
        <div>
          <p className="text-white/40 text-xs mb-1.5">Egendefinert farge</p>
          <input
            type="color"
            defaultValue="#1a1a2e"
            onChange={(e) => setBackground(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
          />
        </div>
      </div>
    </WidgetWrapper>
  )
}
