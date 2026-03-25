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

interface BoardState {
  // Canvas state
  widgets: Widget[]
  background: string
  maxZ: number

  // Persistence state
  currentBoardId: string | null
  currentBoardName: string
  savedBoards: Omit<BoardRow, 'data'>[]
  syncing: boolean
  lastSaved: string | null
  hasUnsavedChanges: boolean

  // Canvas actions
  addWidget: (type: WidgetType, defaults?: Partial<Widget>) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<Widget>) => void
  updateWidgetData: (id: string, data: Record<string, unknown>) => void
  bringToFront: (id: string) => void
  setBackground: (bg: string) => void
  clearBoard: () => void

  // Supabase actions
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
  gestu:      { width: 340, height: 280 },
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      maxZ: 1,
      currentBoardId: null,
      currentBoardName: 'Min tavle',
      savedBoards: [],
      syncing: false,
      lastSaved: null,
      hasUnsavedChanges: false,

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
          // Refresh the list
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
            background: data.background ?? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
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
      name: 'skolesiden-board',
      // Don't persist transient UI state
      partialize: (s) => ({
        widgets: s.widgets,
        background: s.background,
        maxZ: s.maxZ,
        currentBoardId: s.currentBoardId,
        currentBoardName: s.currentBoardName,
      }),
    }
  )
)
