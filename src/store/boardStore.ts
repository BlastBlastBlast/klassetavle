import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveBoard, loadBoard, listBoards, deleteBoard } from '../lib/boardService'
import type { BoardRow } from '../lib/supabase'

export type WidgetType =
  | 'trafikklys'
  | 'tekst'
  | 'bilde'
  | 'klokke'
  | 'terning'
  | 'timer'
  | 'snurrehjul'
  | 'tegning'
  | 'bakgrunn'
  | 'gestu'

export interface Widget {
  id: string
  type: WidgetType
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  data: Record<string, unknown>
}

export interface Canvas {
  id: string
  name: string
  widgets: Widget[]
  background: string
  maxZ: number
}

const DEFAULT_BG = '#FFF8ED'

/** Snapshot the live canvas state back into the canvases array */
const syncCanvas = (
  canvases: Canvas[],
  index: number,
  widgets: Widget[],
  background: string,
  maxZ: number,
): Canvas[] =>
  canvases.map((c, i) => (i === index ? { ...c, widgets, background, maxZ } : c))

interface BoardState {
  // ── Live canvas state (current canvas) ──────────────────────────
  widgets: Widget[]
  background: string
  maxZ: number

  // ── Multi-canvas ─────────────────────────────────────────────────
  canvases: Canvas[]
  currentCanvasIndex: number

  // ── Gesture overlay ───────────────────────────────────────────────
  globalGestureId: string | null

  // ── Supabase persistence ──────────────────────────────────────────
  currentBoardId: string | null
  currentBoardName: string
  savedBoards: Omit<BoardRow, 'data'>[]
  syncing: boolean
  lastSaved: string | null
  hasUnsavedChanges: boolean

  // ── Canvas actions ────────────────────────────────────────────────
  addWidget: (type: WidgetType, defaults?: Partial<Widget>) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<Widget>) => void
  updateWidgetData: (id: string, data: Record<string, unknown>) => void
  bringToFront: (id: string) => void
  setBackground: (bg: string) => void
  clearBoard: () => void

  // ── Multi-canvas actions ──────────────────────────────────────────
  addCanvas: () => void
  switchCanvas: (index: number) => void
  renameCanvas: (index: number, name: string) => void
  deleteCanvas: (index: number) => void

  // ── Gesture action ────────────────────────────────────────────────
  setGlobalGesture: (id: string | null) => void

  // ── Supabase actions ──────────────────────────────────────────────
  setBoardName: (name: string) => void
  syncSave: () => Promise<void>
  syncLoad: (id: string) => Promise<void>
  syncListBoards: () => Promise<void>
  syncDeleteBoard: (id: string) => Promise<void>
  loadBoardData: (data: { widgets: Widget[]; background: string; maxZ: number }) => void
}

const DEFAULT_SIZES: Record<WidgetType, { width: number; height: number }> = {
  trafikklys: { width: 160, height: 340 },
  tekst:      { width: 320, height: 180 },
  bilde:      { width: 300, height: 240 },
  klokke:     { width: 280, height: 320 },
  terning:    { width: 200, height: 200 },
  timer:      { width: 260, height: 220 },
  snurrehjul: { width: 380, height: 420 },
  tegning:    { width: 500, height: 400 },
  bakgrunn:   { width: 320, height: 420 },
  gestu:      { width: 340, height: 300 },
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      background: DEFAULT_BG,
      maxZ: 1,
      canvases: [{ id: 'canvas-1', name: 'Tavle 1', widgets: [], background: DEFAULT_BG, maxZ: 1 }],
      currentCanvasIndex: 0,
      globalGestureId: null,
      currentBoardId: null,
      currentBoardName: 'Min tavle',
      savedBoards: [],
      syncing: false,
      lastSaved: null,
      hasUnsavedChanges: false,

      // ── Canvas actions ──────────────────────────────────────────
      addWidget: (type, defaults = {}) => {
        const { widgets, maxZ } = get()
        const size = DEFAULT_SIZES[type]
        const id = `${type}-${Date.now()}`
        const offset = (widgets.length % 8) * 20
        const newWidget: Widget = {
          id, type,
          x: 100 + offset, y: 100 + offset,
          width: size.width, height: size.height,
          zIndex: maxZ + 1,
          data: {},
          ...defaults,
        }
        set({ widgets: [...widgets, newWidget], maxZ: maxZ + 1, hasUnsavedChanges: true })
      },

      removeWidget: (id) =>
        set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id), hasUnsavedChanges: true })),

      updateWidget: (id, updates) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
          hasUnsavedChanges: true,
        })),

      updateWidgetData: (id, data) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, data: { ...w.data, ...data } } : w
          ),
          hasUnsavedChanges: true,
        })),

      bringToFront: (id) => {
        const { maxZ } = get()
        const newZ = maxZ + 1
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w)),
          maxZ: newZ,
        }))
      },

      setBackground: (bg) => set({ background: bg, hasUnsavedChanges: true }),

      clearBoard: () => set({ widgets: [], maxZ: 1, hasUnsavedChanges: true }),

      // ── Multi-canvas actions ────────────────────────────────────
      addCanvas: () => {
        const { widgets, background, maxZ, canvases, currentCanvasIndex } = get()
        const saved = syncCanvas(canvases, currentCanvasIndex, widgets, background, maxZ)
        const newCanvas: Canvas = {
          id: `canvas-${Date.now()}`,
          name: `Tavle ${saved.length + 1}`,
          widgets: [],
          background: DEFAULT_BG,
          maxZ: 1,
        }
        set({
          canvases: [...saved, newCanvas],
          currentCanvasIndex: saved.length,
          widgets: [],
          background: DEFAULT_BG,
          maxZ: 1,
          hasUnsavedChanges: true,
        })
      },

      switchCanvas: (index) => {
        const { widgets, background, maxZ, canvases, currentCanvasIndex } = get()
        if (index === currentCanvasIndex || index < 0 || index >= canvases.length) return
        const saved = syncCanvas(canvases, currentCanvasIndex, widgets, background, maxZ)
        const target = saved[index]
        set({
          canvases: saved,
          currentCanvasIndex: index,
          widgets: target.widgets,
          background: target.background,
          maxZ: target.maxZ,
          hasUnsavedChanges: true,
        })
      },

      renameCanvas: (index, name) =>
        set((s) => ({
          canvases: s.canvases.map((c, i) => (i === index ? { ...c, name } : c)),
          hasUnsavedChanges: true,
        })),

      deleteCanvas: (index) => {
        const { canvases, currentCanvasIndex, widgets, background, maxZ } = get()
        if (canvases.length <= 1) return

        // Snapshot current canvas unless it's the one being deleted
        const base =
          index === currentCanvasIndex
            ? canvases
            : syncCanvas(canvases, currentCanvasIndex, widgets, background, maxZ)

        const newCanvases = base.filter((_, i) => i !== index)

        // Decide which canvas to land on
        let newIndex = currentCanvasIndex
        if (index === currentCanvasIndex) {
          newIndex = Math.max(0, index - 1)
        } else if (index < currentCanvasIndex) {
          newIndex = currentCanvasIndex - 1
        }
        newIndex = Math.min(newIndex, newCanvases.length - 1)

        const target = newCanvases[newIndex]
        set({
          canvases: newCanvases,
          currentCanvasIndex: newIndex,
          widgets: target.widgets,
          background: target.background,
          maxZ: target.maxZ,
          hasUnsavedChanges: true,
        })
      },

      // ── Gesture ────────────────────────────────────────────────
      setGlobalGesture: (id) => set({ globalGestureId: id }),

      // ── Supabase actions ────────────────────────────────────────
      setBoardName: (name) => set({ currentBoardName: name, hasUnsavedChanges: true }),

      loadBoardData: (data) =>
        set({ ...data, hasUnsavedChanges: false, lastSaved: new Date().toISOString() }),

      syncSave: async () => {
        const { widgets, background, maxZ, currentBoardId, currentBoardName } = get()
        set({ syncing: true })
        const result = await saveBoard(currentBoardId, currentBoardName, { widgets, background, maxZ })
        if (result) {
          set({
            syncing: false,
            currentBoardId: result.id,
            hasUnsavedChanges: false,
            lastSaved: new Date().toISOString(),
          })
          get().syncListBoards()
        } else {
          set({ syncing: false })
        }
      },

      syncLoad: async (id) => {
        set({ syncing: true })
        const row = await loadBoard(id)
        if (row) {
          const data = row.data as { widgets: Widget[]; background: string; maxZ: number }
          set({
            widgets: data.widgets ?? [],
            background: data.background ?? DEFAULT_BG,
            maxZ: data.maxZ ?? 1,
            currentBoardId: row.id,
            currentBoardName: row.name,
            syncing: false,
            hasUnsavedChanges: false,
            lastSaved: row.updated_at,
          })
        } else {
          set({ syncing: false })
        }
      },

      syncListBoards: async () => {
        const boards = await listBoards()
        set({ savedBoards: boards })
      },

      syncDeleteBoard: async (id) => {
        const ok = await deleteBoard(id)
        if (ok) {
          const { currentBoardId } = get()
          if (currentBoardId === id) set({ currentBoardId: null, currentBoardName: 'Min tavle' })
          get().syncListBoards()
        }
      },
    }),
    {
      name: 'klassetavle-board',

      // Only persist what's needed — canvases array is the source of truth
      partialize: (s) => ({
        canvases: syncCanvas(s.canvases, s.currentCanvasIndex, s.widgets, s.background, s.maxZ),
        currentCanvasIndex: s.currentCanvasIndex,
        globalGestureId: s.globalGestureId,
        // Legacy fields kept for Supabase sync compat
        widgets: s.widgets,
        background: s.background,
        maxZ: s.maxZ,
        currentBoardId: s.currentBoardId,
        currentBoardName: s.currentBoardName,
      }),

      // Migrate old localStorage (no canvases) and ensure live state matches active canvas
      merge: (persisted, current) => {
        const p = persisted as Partial<BoardState>

        // ── Old version: no canvases field → wrap legacy widgets into canvas 1 ──
        if (!p.canvases || p.canvases.length === 0) {
          const legacy: Canvas = {
            id: 'canvas-1',
            name: 'Tavle 1',
            widgets: (p.widgets ?? []) as Widget[],
            background: (p.background as string | undefined) ?? current.background,
            maxZ: (p.maxZ as number | undefined) ?? 1,
          }
          return {
            ...current,
            ...p,
            canvases: [legacy],
            currentCanvasIndex: 0,
            widgets: legacy.widgets,
            background: legacy.background,
            maxZ: legacy.maxZ,
          } as BoardState
        }

        // ── Normal load: hydrate live state from active canvas ──
        const idx = Math.min(
          (p.currentCanvasIndex ?? 0),
          p.canvases.length - 1,
        )
        const active = p.canvases[idx]
        return {
          ...current,
          ...p,
          currentCanvasIndex: idx,
          widgets: active.widgets,
          background: active.background,
          maxZ: active.maxZ,
        } as BoardState
      },
    }
  )
)
