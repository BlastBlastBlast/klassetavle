import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'

export function CanvasNavigator() {
  const {
    canvases,
    currentCanvasIndex,
    switchCanvas,
    addCanvas,
    renameCanvas,
    deleteCanvas,
  } = useBoardStore()

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = canvases[currentCanvasIndex]

  const startEdit = () => {
    setNameInput(current?.name ?? '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitEdit = () => {
    const trimmed = nameInput.trim()
    if (trimmed) renameCanvas(currentCanvasIndex, trimmed)
    setEditing(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000) // auto-cancel after 3s
      return
    }
    deleteCanvas(currentCanvasIndex)
    setConfirmDelete(false)
  }

  if (canvases.length === 0) return null

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9997] flex items-center gap-1 px-2 py-1.5 rounded-full select-none"
      style={{
        background: 'rgba(12,12,28,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* ← Prev */}
      <button
        onClick={() => switchCanvas(currentCanvasIndex - 1)}
        disabled={currentCanvasIndex === 0}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-25 transition-all"
        title="Forrige tavle"
      >
        <ChevronLeft size={14} className="text-white/70" />
      </button>

      {/* Canvas dots */}
      <div className="flex items-center gap-1 px-1">
        {canvases.map((c, i) => (
          <button
            key={c.id}
            onClick={() => switchCanvas(i)}
            title={c.name}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentCanvasIndex ? '18px' : '7px',
              height: '7px',
              background: i === currentCanvasIndex
                ? 'rgba(255,255,255,0.9)'
                : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>

      {/* Canvas name — double-click to rename */}
      <div className="px-1.5 min-w-[72px] max-w-[140px] text-center">
        {editing ? (
          <input
            ref={inputRef}
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
              e.stopPropagation()
            }}
            className="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-0.5 outline-none border border-blue-400/60 text-center"
            style={{ minWidth: '80px' }}
          />
        ) : (
          <button
            onDoubleClick={startEdit}
            title="Dobbeltklikk for å gi nytt navn"
            className="text-white/65 text-xs hover:text-white/90 transition-colors truncate max-w-full block"
          >
            {current?.name}
          </button>
        )}
      </div>

      {/* → Next */}
      <button
        onClick={() => switchCanvas(currentCanvasIndex + 1)}
        disabled={currentCanvasIndex >= canvases.length - 1}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-25 transition-all"
        title="Neste tavle"
      >
        <ChevronRight size={14} className="text-white/70" />
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* + Add canvas */}
      <button
        onClick={addCanvas}
        title="Ny tavle"
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
      >
        <Plus size={13} className="text-white/55 hover:text-white/90" />
      </button>

      {/* Delete — only shown when more than one canvas */}
      {canvases.length > 1 && (
        <>
          <div className="w-px h-4 bg-white/10 mx-0.5" />
          <button
            onClick={handleDelete}
            title={confirmDelete ? 'Klikk én gang til for å bekrefte' : 'Slett denne tavlen'}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-all group ${
              confirmDelete ? 'bg-red-500/30' : 'hover:bg-red-500/15'
            }`}
          >
            <Trash2
              size={12}
              className={`transition-colors ${
                confirmDelete ? 'text-red-400' : 'text-white/25 group-hover:text-red-400'
              }`}
            />
          </button>
        </>
      )}
    </div>
  )
}
