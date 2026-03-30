import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import { useState, useRef } from 'react'

const PRESET_BACKGROUNDS = [
  { label: 'Papir',    value: '#FFF8ED' },
  { label: 'Himmel',   value: 'linear-gradient(160deg, #BFE8FF 0%, #E8F7FF 100%)' },
  { label: 'Solskinn', value: 'linear-gradient(160deg, #FFE066 0%, #FFF3BF 100%)' },
  { label: 'Eng',      value: 'linear-gradient(160deg, #69DB7C 0%, #D3F9D8 100%)' },
  { label: 'Solnedgang', value: 'linear-gradient(160deg, #FF8787 0%, #FFD8A8 100%)' },
  { label: 'Hav',      value: 'linear-gradient(160deg, #4DABF7 0%, #A5D8FF 100%)' },
  { label: 'Lilla',    value: 'linear-gradient(160deg, #CC5DE8 0%, #F3D9FA 100%)' },
  { label: 'Mintgrønn', value: 'linear-gradient(160deg, #38D9A9 0%, #C3FAE8 100%)' },
  { label: 'Jordbær',  value: 'linear-gradient(160deg, #F03E3E 0%, #FFB8B8 100%)' },
  { label: 'Natt',     value: 'linear-gradient(160deg, #1E1B2E 0%, #2D2A3E 100%)' },
  { label: 'Hvit',     value: '#FFFFFF' },
  { label: 'Kritt',    value: '#2B2D42' },
]

const inputStyle: React.CSSProperties = {
  background: 'var(--panel-bg-alt)',
  border: '1.5px solid var(--panel-border)',
  color: 'var(--ink)',
}

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
      <div className="flex flex-col gap-3 h-full p-3 overflow-y-auto" style={{ color: 'var(--ink)' }}>
        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Velg bakgrunn for tavlen</p>

        {/* Preset grid */}
        <div className="grid grid-cols-3 gap-2">
          {PRESET_BACKGROUNDS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setBackground(value)}
              className="relative rounded-xl overflow-hidden aspect-video transition-all group"
              style={{
                background: value,
                border: '2.5px solid var(--panel-border)',
                boxShadow: '2px 2px 0 var(--shadow-color)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7C3AED' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--panel-border)' }}
            >
              <div
                className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-1"
                style={{ background: 'rgba(0,0,0,0.18)' }}
              >
                <span className="text-white text-[10px] font-bold drop-shadow">{label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="h-px" style={{ background: 'var(--panel-border)' }} />

        {/* URL input */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>Bakgrunnsbilde fra URL</p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyImage(urlInput)}
              placeholder="https://..."
              className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none"
              style={{ ...inputStyle, fontSize: 11 }}
            />
            <button
              onClick={() => applyImage(urlInput)}
              className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
              style={{ background: '#4D9FFF', color: '#FFFFFF', border: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#228BE6' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#4D9FFF' }}
            >
              Bruk
            </button>
          </div>
        </div>

        {/* File upload */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>Last opp bilde</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl py-3 text-sm font-bold transition-colors"
            style={{
              border: '2px dashed var(--panel-border)',
              color: 'var(--ink-muted)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.color = '#7C3AED' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--panel-border)'; e.currentTarget.style.color = 'var(--ink-muted)' }}
          >
            📁 Velg fil
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        {/* Custom color */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>Egendefinert farge</p>
          <input
            type="color"
            defaultValue="#FFF8ED"
            onChange={(e) => setBackground(e.target.value)}
            className="w-full h-10 rounded-lg cursor-pointer"
            style={{ border: '2px solid var(--panel-border)', background: 'var(--panel-bg-alt)' }}
          />
        </div>
      </div>
    </WidgetWrapper>
  )
}
