import { useRef, useState } from 'react'
import { useBoardStore } from '../../store/boardStore'
import type { Widget } from '../../store/boardStore'
import { WidgetWrapper } from '../canvas/WidgetWrapper'
import { useAuthStore } from '../../store/authStore'
import { uploadImage } from '../../lib/boardService'
import { Link, Upload, Loader } from 'lucide-react'

export function Bilde({ widget }: { widget: Widget }) {
  const { updateWidgetData } = useBoardStore()
  const { user } = useAuthStore()
  const src = widget.data.src as string | undefined
  const [urlInput, setUrlInput] = useState('')
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [error, setError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const applyUrl = () => {
    if (urlInput.trim()) {
      updateWidgetData(widget.id, { src: urlInput.trim() })
      setError(false)
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Use Supabase Storage if logged in, else fall back to local data URL
    if (user) {
      setUploading(true)
      const url = await uploadImage(file, user.id)
      setUploading(false)
      if (url) {
        updateWidgetData(widget.id, { src: url })
        setError(false)
      } else {
        setError(true)
      }
    } else {
      const reader = new FileReader()
      reader.onload = (ev) => {
        updateWidgetData(widget.id, { src: ev.target?.result as string })
        setError(false)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <WidgetWrapper widget={widget} minWidth={150} minHeight={120} title="Bilde">
      <div className="flex flex-col h-full bg-black/20">
        {src && !error ? (
          <div className="relative flex-1 group">
            <img
              src={src}
              alt="widget"
              className="w-full h-full object-contain"
              onError={() => setError(true)}
            />
            <button
              onClick={() => { updateWidgetData(widget.id, { src: undefined }); setError(false) }}
              className="absolute top-2 right-2 bg-black/60 text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Bytt
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 h-full p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${mode === 'url' ? 'bg-blue-500/30 text-blue-300' : 'text-white/50 hover:bg-white/10'}`}
              >
                <Link size={14} /> URL
              </button>
              <button
                onClick={() => setMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${mode === 'upload' ? 'bg-blue-500/30 text-blue-300' : 'text-white/50 hover:bg-white/10'}`}
              >
                <Upload size={14} /> Last opp
              </button>
            </div>

            {mode === 'url' ? (
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyUrl()}
                  placeholder="Lim inn bilde-URL..."
                  className="bg-white/10 text-white text-sm rounded-lg px-3 py-2 border border-white/10 outline-none focus:border-blue-400 placeholder-white/30 w-full"
                />
                <button
                  onClick={applyUrl}
                  className="bg-blue-500/80 hover:bg-blue-500 text-white text-sm py-1.5 rounded-lg transition-colors"
                >
                  Legg til bilde
                </button>
                {error && <p className="text-red-400 text-xs text-center">Kunne ikke laste bildet</p>}
              </div>
            ) : (
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                className="flex flex-col items-center gap-2 border-2 border-dashed border-white/20 hover:border-blue-400/50 rounded-xl px-6 py-6 cursor-pointer transition-colors w-full max-w-xs"
              >
                {uploading
                  ? <Loader size={28} className="text-blue-400 animate-spin" />
                  : <Upload size={28} className="text-white/30" />
                }
                <span className="text-white/50 text-sm">
                  {uploading ? 'Laster opp...' : 'Klikk for å velge fil'}
                </span>
                {!user && <span className="text-white/30 text-xs text-center">Logg inn for skylagring</span>}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            )}
          </div>
        )}
      </div>
    </WidgetWrapper>
  )
}
