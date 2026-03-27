import { useState } from 'react'
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react'
import {
  useTimelineStore,
  type DaySchedule,
  type TimeEntry,
  type EntryType,
} from '../../store/timelineStore'
import { TYPE_COLOR, TYPE_LABEL } from './timelineConstants'

const ALL_DAYS = [
  { n: 1, label: 'Man' },
  { n: 2, label: 'Tir' },
  { n: 3, label: 'Ons' },
  { n: 4, label: 'Tor' },
  { n: 5, label: 'Fre' },
]

const ENTRY_TYPES = Object.keys(TYPE_LABEL) as EntryType[]

// ── Inline editable entry row ─────────────────────────────────────────────────
function EntryRow({ scheduleId, entry }: { scheduleId: string; entry: TimeEntry }) {
  const { updateEntry, deleteEntry } = useTimelineStore()
  const [editing, setEditing] = useState(false)
  const [time,  setTime]  = useState(entry.time)
  const [label, setLabel] = useState(entry.label)
  const [type,  setType]  = useState<EntryType>(entry.type)

  function commit() {
    if (time.match(/^\d{2}:\d{2}$/)) updateEntry(scheduleId, entry.id, { time, label, type })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 py-1 px-2 rounded-lg bg-white/5 border border-white/10">
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
          className="bg-white/10 text-white text-xs rounded px-1 py-0.5 w-[70px] outline-none" />
        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
          className="bg-white/10 text-white text-xs rounded px-1 py-0.5 flex-1 outline-none min-w-0"
          placeholder="Aktivitet" />
        <select value={type} onChange={(e) => setType(e.target.value as EntryType)}
          className="bg-white/10 text-white text-xs rounded px-1 py-0.5 outline-none"
          style={{ color: TYPE_COLOR[type] }}>
          {ENTRY_TYPES.map((t) => (
            <option key={t} value={t} style={{ background: '#111', color: TYPE_COLOR[t] }}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <button onClick={commit} className="w-6 h-6 flex items-center justify-center rounded hover:bg-green-500/20">
          <Check size={12} className="text-green-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-white/5 group">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLOR[entry.type] }} />
      <span className="text-white/50 font-mono text-xs w-[38px] shrink-0">{entry.time}</span>
      <span className="text-white/80 text-xs flex-1 min-w-0 truncate">{entry.label}</span>
      <span className="text-[10px] hidden group-hover:block shrink-0" style={{ color: TYPE_COLOR[entry.type] }}>
        {TYPE_LABEL[entry.type]}
      </span>
      <button onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-all">
        <Edit2 size={10} className="text-white/50" />
      </button>
      <button onClick={() => deleteEntry(scheduleId, entry.id)}
        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 transition-all">
        <Trash2 size={10} className="text-red-400/70" />
      </button>
    </div>
  )
}

// ── Schedule card ─────────────────────────────────────────────────────────────
function ScheduleCard({ schedule }: { schedule: DaySchedule }) {
  const { updateSchedule, deleteSchedule, addEntry } = useTimelineStore()
  const [editingName, setEditingName] = useState(false)
  const [nameInput,   setNameInput]   = useState(schedule.name)
  const [addingEntry, setAddingEntry] = useState(false)
  const [newTime,  setNewTime]  = useState('09:00')
  const [newLabel, setNewLabel] = useState('')
  const [newType,  setNewType]  = useState<EntryType>('fag')

  function commitName() {
    if (nameInput.trim()) updateSchedule(schedule.id, { name: nameInput.trim() })
    setEditingName(false)
  }

  function toggleDay(day: number) {
    const days = schedule.days.includes(day)
      ? schedule.days.filter((d) => d !== day)
      : [...schedule.days, day].sort()
    updateSchedule(schedule.id, { days })
  }

  function commitNewEntry() {
    if (!newLabel.trim() || !newTime.match(/^\d{2}:\d{2}$/)) return
    addEntry(schedule.id, { id: `entry-${Date.now()}`, time: newTime, label: newLabel.trim(), type: newType })
    setNewLabel(''); setNewTime('09:00'); setNewType('fag'); setAddingEntry(false)
  }

  return (
    <div className="rounded-xl p-3 flex flex-col gap-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* Header */}
      <div className="flex items-center gap-2">
        {editingName ? (
          <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false) }}
            className="flex-1 bg-white/10 text-white text-sm rounded-lg px-2 py-0.5 outline-none border border-blue-400/40" />
        ) : (
          <button onDoubleClick={() => { setNameInput(schedule.name); setEditingName(true) }}
            className="flex-1 text-left text-white/80 text-sm font-medium hover:text-white transition-colors"
            title="Dobbeltklikk for å gi nytt navn">
            {schedule.name}
          </button>
        )}
        <button onClick={() => deleteSchedule(schedule.id)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 transition-all" title="Slett">
          <Trash2 size={12} className="text-red-400/50" />
        </button>
      </div>

      {/* Day toggles */}
      <div className="flex gap-1">
        {ALL_DAYS.map(({ n, label }) => (
          <button key={n} onClick={() => toggleDay(n)}
            className="rounded-md px-2 py-0.5 text-xs font-medium transition-all"
            style={{
              background: schedule.days.includes(n) ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)',
              color:      schedule.days.includes(n) ? '#93c5fd' : 'rgba(255,255,255,0.35)',
              border:     schedule.days.includes(n) ? '1px solid rgba(59,130,246,0.5)' : '1px solid transparent',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
        {schedule.entries.map((entry) => (
          <EntryRow key={entry.id} scheduleId={schedule.id} entry={entry} />
        ))}
      </div>

      {/* Add entry */}
      {addingEntry ? (
        <div className="flex items-center gap-1 pt-1 border-t border-white/5">
          <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
            className="bg-white/10 text-white text-xs rounded px-1 py-0.5 w-[70px] outline-none" />
          <input autoFocus type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitNewEntry() }}
            className="bg-white/10 text-white text-xs rounded px-1 py-0.5 flex-1 outline-none min-w-0"
            placeholder="Aktivitet" />
          <select value={newType} onChange={(e) => setNewType(e.target.value as EntryType)}
            className="bg-white/10 text-white text-xs rounded px-1 py-0.5 outline-none">
            {ENTRY_TYPES.map((t) => (
              <option key={t} value={t} style={{ background: '#111' }}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
          <button onClick={commitNewEntry} className="w-6 h-6 flex items-center justify-center rounded hover:bg-green-500/20">
            <Check size={12} className="text-green-400" />
          </button>
          <button onClick={() => setAddingEntry(false)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10">
            <X size={12} className="text-white/40" />
          </button>
        </div>
      ) : (
        <button onClick={() => setAddingEntry(true)}
          className="flex items-center gap-1 text-white/30 hover:text-white/60 text-xs transition-colors pt-0.5">
          <Plus size={11} />
          Legg til aktivitet
        </button>
      )}
    </div>
  )
}

// ── Main settings panel ───────────────────────────────────────────────────────
interface Props {
  onClose: () => void
  topOffset: number
  // Passed from TimelineControls so both entry-points share the same handlers
  onZoomIn: () => void
  onZoomOut: () => void
  onToggle: () => void
  zoom: number
}

export function TimelineSettings({ onClose, topOffset }: Props) {
  const { schedules, startTime, endTime, addSchedule, setStartTime, setEndTime } = useTimelineStore()
  const [localStart, setLocalStart] = useState(startTime)
  const [localEnd,   setLocalEnd]   = useState(endTime)

  function commitStart(val: string) {
    if (val.match(/^\d{2}:\d{2}$/) && val < localEnd) {
      setStartTime(val); setLocalStart(val)
    }
  }
  function commitEnd(val: string) {
    if (val.match(/^\d{2}:\d{2}$/) && val > localStart) {
      setEndTime(val); setLocalEnd(val)
    }
  }

  return (
    <div
      className="fixed left-0 right-0 z-[9997] flex flex-col"
      style={{
        top: topOffset,
        maxHeight: `calc(100vh - ${topOffset + 48}px)`,
        background: 'rgba(10,10,24,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/8 shrink-0">
        <span className="text-white/70 text-sm font-semibold">Innstillinger — Tidslinje</span>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <X size={14} className="text-white/50" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ── Time window ──────────────────────────────────────────────────── */}
        <div className="rounded-xl p-3 flex flex-col gap-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-white/50 text-xs font-semibold tracking-wider uppercase">Tidsvindu</span>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-white/40 text-xs">Fra</label>
              <input
                type="time"
                value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
                onBlur={(e) => commitStart(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitStart(localStart) }}
                className="bg-white/10 text-white text-sm rounded-lg px-2 py-1.5 outline-none border border-white/10 focus:border-blue-400/60 w-full"
              />
            </div>
            <div className="text-white/20 mt-4">→</div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-white/40 text-xs">Til</label>
              <input
                type="time"
                value={localEnd}
                onChange={(e) => setLocalEnd(e.target.value)}
                onBlur={(e) => commitEnd(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEnd(localEnd) }}
                className="bg-white/10 text-white text-sm rounded-lg px-2 py-1.5 outline-none border border-white/10 focus:border-blue-400/60 w-full"
              />
            </div>
          </div>
        </div>

        {/* ── Schedules ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <span className="text-white/50 text-xs font-semibold tracking-wider uppercase">Timeplaner</span>
          {schedules.map((sc) => (
            <ScheduleCard key={sc.id} schedule={sc} />
          ))}
          <button
            onClick={() => addSchedule({ id: `schedule-${Date.now()}`, name: 'Ny timeplan', days: [], entries: [] })}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-white/40 hover:text-white/70 transition-all text-sm"
            style={{ border: '1px dashed rgba(255,255,255,0.12)' }}>
            <Plus size={14} />
            Ny timeplan
          </button>
        </div>
      </div>
    </div>
  )
}
