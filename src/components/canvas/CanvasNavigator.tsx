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

  const [editing, setEditing]           = useState(false)
  const [nameInput, setNameInput]       = useState('')
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
      setTimeout(() => setConfirmDelete(false), 3000)
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
        background: 'var(--panel-bg)',
        border: '2.5px solid var(--panel-border)',
        boxShadow: 'var(--shadow-md)',
        maxWidth: 'calc(100vw - 1rem)',
        overflow: 'hidden',
      }}
    >
      {/* ← Prev */}
      <button
        onClick={() => switchCanvas(currentCanvasIndex - 1)}
        disabled={currentCanvasIndex === 0}
        className="w-7 h-7 flex items-center justify-center rounded-full transition-all disabled:opacity-25"
        style={{ color: '#7C3AED' }}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#F3F0FF' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        title="Forrige tavle"
      >
        <ChevronLeft size={14} />
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
              width: i === currentCanvasIndex ? 18 : 7,
              height: 7,
              background: i === currentCanvasIndex ? '#7C3AED' : '#C8B89A',
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
            className="w-full rounded-lg px-2 py-0.5 outline-none text-center text-xs font-bold"
            style={{
              minWidth: 80,
              background: '#F3F0FF',
              border: '2px solid #7C3AED',
              color: 'var(--ink)',
            }}
          />
        ) : (
          <button
            onDoubleClick={startEdit}
            title="Dobbeltklikk for å gi nytt navn"
            className="text-xs font-bold truncate max-w-full block transition-colors"
            style={{ color: '#5D7078' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#7C3AED' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5D7078' }}
          >
            {current?.name}
          </button>
        )}
      </div>

      {/* → Next */}
      <button
        onClick={() => switchCanvas(currentCanvasIndex + 1)}
        disabled={currentCanvasIndex >= canvases.length - 1}
        className="w-7 h-7 flex items-center justify-center rounded-full transition-all disabled:opacity-25"
        style={{ color: '#7C3AED' }}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#F3F0FF' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        title="Neste tavle"
      >
        <ChevronRight size={14} />
      </button>

      {/* Divider */}
      <div className="w-px h-4 mx-0.5" style={{ background: 'var(--panel-border)' }} />

      {/* + Add canvas */}
      <button
        onClick={addCanvas}
        title="Ny tavle"
        className="w-7 h-7 flex items-center justify-center rounded-full transition-all"
        style={{ color: '#7C3AED' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F0FF' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <Plus size={13} />
      </button>

      {/* Delete */}
      {canvases.length > 1 && (
        <>
          <div className="w-px h-4 mx-0.5" style={{ background: 'var(--panel-border)' }} />
          <button
            onClick={handleDelete}
            title={confirmDelete ? 'Klikk én gang til for å bekrefte' : 'Slett denne tavlen'}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-all"
            style={{
              background: confirmDelete ? '#FFF0F0' : 'transparent',
              color: confirmDelete ? '#F03E3E' : '#C8B89A',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFF0F0'
              e.currentTarget.style.color = '#F03E3E'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = confirmDelete ? '#FFF0F0' : 'transparent'
              e.currentTarget.style.color = confirmDelete ? '#F03E3E' : '#C8B89A'
            }}
          >
            <Trash2 size={12} />
          </button>
        </>
      )}
    </div>
  )
}
