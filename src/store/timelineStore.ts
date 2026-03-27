import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type EntryType =
  | 'fag'
  | 'friminutt'
  | 'frukt'
  | 'spising'
  | 'storefri'
  | 'aks'
  | 'special'
  | 'custom'

export interface TimeEntry {
  id: string
  time: string   // "HH:MM"
  label: string
  type: EntryType
}

export interface DaySchedule {
  id: string
  name: string
  days: number[] // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  entries: TimeEntry[]
}

// ── Default schedules ─────────────────────────────────────────────────────────

const MWF_ENTRIES: TimeEntry[] = [
  { id: 'mwf-1',  time: '08:30', label: 'Fag',      type: 'fag'      },
  { id: 'mwf-2',  time: '09:45', label: 'Frukt',    type: 'frukt'    },
  { id: 'mwf-3',  time: '10:00', label: 'Friminutt',type: 'friminutt'},
  { id: 'mwf-4',  time: '10:15', label: 'Fag',      type: 'fag'      },
  { id: 'mwf-5',  time: '11:00', label: 'Spising',  type: 'spising'  },
  { id: 'mwf-6',  time: '11:30', label: 'Storefri', type: 'storefri' },
  { id: 'mwf-7',  time: '12:00', label: 'Fag',      type: 'fag'      },
  { id: 'mwf-8',  time: '13:30', label: 'AKS',      type: 'aks'      },
]

const TT_ENTRIES: TimeEntry[] = [
  { id: 'tt-1',   time: '08:30', label: 'Fag',      type: 'fag'      },
  { id: 'tt-2',   time: '09:45', label: 'Frukt',    type: 'frukt'    },
  { id: 'tt-3',   time: '10:00', label: 'Friminutt',type: 'friminutt'},
  { id: 'tt-4',   time: '10:15', label: 'Fag',      type: 'fag'      },
  { id: 'tt-5',   time: '11:00', label: 'Spising',  type: 'spising'  },
  { id: 'tt-6',   time: '11:30', label: 'Storefri', type: 'storefri' },
  { id: 'tt-7',   time: '12:00', label: 'Fag',      type: 'fag'      },
  { id: 'tt-8',   time: '13:00', label: 'Friminutt',type: 'friminutt'},
  { id: 'tt-9',   time: '13:15', label: 'Fag',      type: 'fag'      },
  { id: 'tt-10',  time: '14:15', label: 'AKS',      type: 'aks'      },
]

const DEFAULT_SCHEDULES: DaySchedule[] = [
  {
    id: 'schedule-mwf',
    name: 'Man, ons, fre',
    days: [1, 3, 5],
    entries: MWF_ENTRIES,
  },
  {
    id: 'schedule-tt',
    name: 'Tir, tor',
    days: [2, 4],
    entries: TT_ENTRIES,
  },
]

// ── Store ─────────────────────────────────────────────────────────────────────

interface TimelineState {
  visible: boolean
  zoom: number          // multiplier: 1 | 2 | 4 | 8 | 16
  startTime: string     // "HH:MM" — left edge of the timeline
  endTime: string       // "HH:MM" — right edge of the timeline
  schedules: DaySchedule[]

  toggle: () => void
  setVisible: (v: boolean) => void
  setZoom: (z: number) => void
  setStartTime: (t: string) => void
  setEndTime: (t: string) => void

  addSchedule: (schedule: DaySchedule) => void
  updateSchedule: (id: string, patch: Partial<Omit<DaySchedule, 'id'>>) => void
  deleteSchedule: (id: string) => void

  addEntry: (scheduleId: string, entry: TimeEntry) => void
  updateEntry: (scheduleId: string, entryId: string, patch: Partial<Omit<TimeEntry, 'id'>>) => void
  deleteEntry: (scheduleId: string, entryId: string) => void
}

export const ZOOM_LEVELS = [1, 2, 4, 8, 16] as const

/** Base pixels per minute at zoom=1 */
export const BASE_PX_PER_MIN = 2

/** Default school day window (overrideable per store) */
export const DEFAULT_DAY_START = '07:30'
export const DEFAULT_DAY_END   = '15:30'

// Keep old names as aliases so callers that haven't migrated still compile
export const DAY_START = DEFAULT_DAY_START
export const DAY_END   = DEFAULT_DAY_END

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set) => ({
      visible: true,
      zoom: 1,
      startTime: DEFAULT_DAY_START,
      endTime: DEFAULT_DAY_END,
      schedules: DEFAULT_SCHEDULES,

      toggle: () => set((s) => ({ visible: !s.visible })),
      setVisible: (visible) => set({ visible }),
      setZoom: (zoom) => set({ zoom }),
      setStartTime: (startTime) => set({ startTime }),
      setEndTime: (endTime) => set({ endTime }),

      addSchedule: (schedule) =>
        set((s) => ({ schedules: [...s.schedules, schedule] })),

      updateSchedule: (id, patch) =>
        set((s) => ({
          schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
        })),

      deleteSchedule: (id) =>
        set((s) => ({ schedules: s.schedules.filter((sc) => sc.id !== id) })),

      addEntry: (scheduleId, entry) =>
        set((s) => ({
          schedules: s.schedules.map((sc) =>
            sc.id === scheduleId
              ? { ...sc, entries: [...sc.entries, entry].sort((a, b) => a.time.localeCompare(b.time)) }
              : sc
          ),
        })),

      updateEntry: (scheduleId, entryId, patch) =>
        set((s) => ({
          schedules: s.schedules.map((sc) =>
            sc.id === scheduleId
              ? {
                  ...sc,
                  entries: sc.entries
                    .map((e) => (e.id === entryId ? { ...e, ...patch } : e))
                    .sort((a, b) => a.time.localeCompare(b.time)),
                }
              : sc
          ),
        })),

      deleteEntry: (scheduleId, entryId) =>
        set((s) => ({
          schedules: s.schedules.map((sc) =>
            sc.id === scheduleId
              ? { ...sc, entries: sc.entries.filter((e) => e.id !== entryId) }
              : sc
          ),
        })),
    }),
    { name: 'klassetavle-timeline' }
  )
)
