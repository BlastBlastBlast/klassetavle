import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useBoardStore } from '../../store/boardStore'
import { supabase } from '../../lib/supabase'
import { Save, LogOut, LogIn, ChevronDown, Plus, Trash2, FolderOpen, Loader, Check } from 'lucide-react'

export function AuthBar() {
  const { user, loading, initialized, sendMagicLink, signOut, init } = useAuthStore()
  const {
    currentBoardName, currentBoardId, savedBoards, syncing, lastSaved, hasUnsavedChanges,
    setBoardName, syncSave, syncLoad, syncListBoards, syncDeleteBoard, clearBoard,
  } = useBoardStore()

  const [showPanel, setShowPanel] = useState(false)
  const [email, setEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [authError, setAuthError] = useState('')
  const [showBoards, setShowBoards] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(currentBoardName)

  // Init auth listener once
  useEffect(() => {
    const unsub = init()
    return unsub
  }, [])

  // Load board list when user logs in
  useEffect(() => {
    if (user) syncListBoards()
  }, [user])

  const handleLogin = async () => {
    if (!email.trim()) return
    setAuthError('')
    const { error } = await sendMagicLink(email.trim())
    if (error) setAuthError(error)
    else setMagicSent(true)
  }

  const handleSave = () => syncSave()

  const handleNewBoard = () => {
    clearBoard()
    setShowBoards(false)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
  }

  // Don't show if Supabase isn't configured
  if (!supabase) return null
  if (!initialized) return null

  // Logged-out: small button in bottom-right corner
  const position = user
    ? 'fixed top-3 right-3 z-[9999] flex items-center gap-2'
    : 'fixed bottom-3 right-3 z-[9999] flex items-center gap-2'

  return (
    <div className={position} style={{ pointerEvents: 'auto' }}>

      {user ? (
        <>
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={syncing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              hasUnsavedChanges
                ? 'bg-blue-500/90 hover:bg-blue-500 text-white'
                : 'bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/80'
            }`}
          >
            {syncing
              ? <Loader size={14} className="animate-spin" />
              : lastSaved && !hasUnsavedChanges
                ? <Check size={14} className="text-green-400" />
                : <Save size={14} />
            }
            {syncing ? 'Lagrer...' : hasUnsavedChanges ? 'Lagre' : lastSaved ? `Lagret ${formatTime(lastSaved)}` : 'Lagre'}
          </button>

          {/* Board picker */}
          <div className="relative">
            <button
              onClick={() => setShowBoards((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-all"
            >
              <FolderOpen size={14} />
              <span className="max-w-32 truncate">{currentBoardName}</span>
              <ChevronDown size={12} className={`transition-transform ${showBoards ? 'rotate-180' : ''}`} />
            </button>

            {showBoards && (
              <div
                className="absolute right-0 top-full mt-1 w-64 rounded-2xl overflow-hidden animate-float-in"
                style={{
                  background: 'rgba(15,15,30,0.96)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {/* Board name editor */}
                <div className="px-3 py-2.5 border-b border-white/10">
                  {editingName ? (
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={() => { setBoardName(nameInput); setEditingName(false) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { setBoardName(nameInput); setEditingName(false) } }}
                      className="w-full bg-white/10 text-white text-sm rounded-lg px-2 py-1 border border-blue-400/50 outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => { setNameInput(currentBoardName); setEditingName(true) }}
                      className="text-white/70 hover:text-white text-sm w-full text-left"
                    >
                      ✏️ {currentBoardName}
                    </button>
                  )}
                </div>

                {/* New board */}
                <button
                  onClick={handleNewBoard}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Plus size={14} /> Ny tavle
                </button>

                {/* Saved boards list */}
                {savedBoards.length > 0 && (
                  <div className="border-t border-white/10">
                    <p className="text-white/30 text-xs px-3 py-1.5">Lagrede tavler</p>
                    {savedBoards.map((board) => (
                      <div key={board.id} className="flex items-center group">
                        <button
                          onClick={() => { syncLoad(board.id); setShowBoards(false) }}
                          className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                            board.id === currentBoardId
                              ? 'text-blue-300 bg-blue-500/10'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <FolderOpen size={12} />
                          <span className="truncate">{board.name}</span>
                          {board.id === currentBoardId && <Check size={10} className="ml-auto text-blue-400 shrink-0" />}
                        </button>
                        <button
                          onClick={() => syncDeleteBoard(board.id)}
                          className="px-2 py-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User + logout */}
          <div className="relative">
            <button
              onClick={() => setShowPanel((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-blue-500/60 flex items-center justify-center text-xs font-bold text-white">
                {user.email?.[0]?.toUpperCase()}
              </div>
            </button>
            {showPanel && (
              <div
                className="absolute right-0 top-full mt-1 w-48 rounded-2xl overflow-hidden animate-float-in"
                style={{
                  background: 'rgba(15,15,30,0.96)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                <div className="px-3 py-2.5 border-b border-white/10">
                  <p className="text-white/40 text-xs truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => { signOut(); setShowPanel(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut size={14} /> Logg ut
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Login button + panel */
        <div className="relative">
          <button
            onClick={() => setShowPanel((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-white/10 hover:bg-white/15 text-white/60 hover:text-white transition-all"
          >
            <LogIn size={14} /> Logg inn
          </button>

          {showPanel && (
            <div
              className="absolute right-0 top-full mt-1 w-64 rounded-2xl overflow-hidden p-4 animate-float-in"
              style={{
                background: 'rgba(15,15,30,0.96)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {magicSent ? (
                <div className="text-center py-2">
                  <div className="text-3xl mb-2">📧</div>
                  <p className="text-white font-semibold text-sm">Sjekk e-posten din!</p>
                  <p className="text-white/50 text-xs mt-1">Vi sendte en innloggingslenke til {email}</p>
                  <button onClick={() => { setMagicSent(false); setEmail('') }} className="text-blue-400 text-xs mt-3 hover:text-blue-300">
                    Prøv igjen
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-white/70 text-sm font-medium">Logg inn for å lagre tavlene dine</p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="din@epost.no"
                    className="bg-white/10 text-white text-sm rounded-xl px-3 py-2 border border-white/10 outline-none focus:border-blue-400 placeholder-white/30"
                  />
                  {authError && <p className="text-red-400 text-xs">{authError}</p>}
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-blue-500/80 hover:bg-blue-500 text-white text-sm py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader size={14} className="animate-spin" /> : <LogIn size={14} />}
                    Send innloggingslenke
                  </button>
                  <p className="text-white/30 text-xs text-center">Ingen passord nødvendig</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
