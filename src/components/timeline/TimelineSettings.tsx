import { useState } from 'react'
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react'
import {
  useTimelineStore,
  type DaySchedule,
  type TimeEntry,
  type EntryType,
} from '../../store/timelineStore'
import { TYPE_COLOR, TYPE_LABEL } from './timelineConstants'

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls = 'text-xs rounded px-1 py-0.5 outline-none'
const inputStyle = {
  background: 'var(--panel-bg-alt)',
  border: '1.5px solid var(--panel-border)',
  color: 'var(--ink)',
}

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
      <div
        className="flex items-center gap-1 py-1 px-2 rounded-lg"
        style={{ background: 'var(--panel-bg-alt)', border: '1.5px solid var(--panel-border)' }}
      >
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
          className={`${inputCls} w-[70px]`} style={inputStyle} />
        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
          className={`${inputCls} flex-1 min-w-0`} style={inputStyle} placeholder="Aktivitet" />
        <select value={type} onChange={(e) => setType(e.target.value as EntryType)}
          className={inputCls} style={{ ...inputStyle, color: TYPE_COLOR[type] }}>
          {ENTRY_TYPES.map((t) => (
            <option key={t} value={t} style={{ background: 'var(--panel-bg)', color: TYPE_COLOR[t] }}>
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
    <div
      className="flex items-center gap-2 py-1 px-2 rounded-lg group transition-colors"
      style={{ color: 'var(--ink)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--panel-bg-alt)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLOR[entry.type] }} />
      <span className="font-mono text-xs w-[38px] shrink-0" style={{ color: 'var(--ink-soft)' }}>{entry.time}</span>
      <span className="text-xs flex-1 min-w-0 truncate" style={{ color: 'var(--ink)' }}>{entry.label}</span>
      <span className="text-[10px] hidden group-hover:block shrink-0" style={{ color: TYPE_COLOR[entry.type] }}>
        {TYPE_LABEL[entry.type]}
      </span>
      <button onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded transition-all"
        style={{ color: 'var(--ink-soft)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--panel-border)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <Edit2 size={10} />
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
    <div
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{ background: 'var(--panel-bg-alt)', border: '1.5px solid var(--panel-border)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        {editingName ? (
          <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false) }}
            className="flex-1 text-sm rounded-lg px-2 py-0.5 outline-none"
            style={{ ...inputStyle, border: '2px solid #7C3AED', fontSize: 13 }} />
        ) : (
          <button onDoubleClick={() => { setNameInput(schedule.name); setEditingName(true) }}
            className="flex-1 text-left text-sm font-bold transition-colors"
            style={{ color: 'var(--ink)' }}
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
            className="rounded-md px-2 py-0.5 text-xs font-bold transition-all"
            style={{
              background: schedule.days.includes(n) ? 'rgba(59,130,246,0.2)' : 'var(--panel-bg)',
              color:      schedule.days.includes(n) ? '#4D9FFF' : 'var(--ink-muted)',
              border:     schedule.days.includes(n) ? '1.5px solid rgba(59,130,246,0.5)' : '1.5px solid var(--panel-border)',
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
        <div
          className="flex items-center gap-1 pt-1"
          style={{ borderTop: '1px solid var(--panel-border)' }}
        >
          <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
            className={`${inputCls} w-[70px]`} style={inputStyle} />
          <input autoFocus type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitNewEntry() }}
            className={`${inputCls} flex-1 min-w-0`} style={inputStyle} placeholder="Aktivitet" />
          <select value={newType} onChange={(e) => setNewType(e.target.value as EntryType)}
            className={inputCls} style={inputStyle}>
            {ENTRY_TYPES.map((t) => (
              <option key={t} value={t} style={{ background: 'var(--panel-bg)' }}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
          <button onClick={commitNewEntry} className="w-6 h-6 flex items-center justify-center rounded hover:bg-green-500/20">
            <Check size={12} className="text-green-400" />
          </button>
          <button onClick={() => setAddingEntry(false)}
            className="w-6 h-6 flex items-center justify-center rounded transition-all"
            style={{ color: 'var(--ink-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--panel-border)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button onClick={() => setAddingEntry(true)}
          className="flex items-center gap-1 text-xs transition-colors pt-0.5 font-semibold"
          style={{ color: 'var(--ink-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#7C3AED' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)' }}
        >
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
        background: 'var(--panel-bg)',
        borderBottom: '2.5px solid var(--panel-border)',
        boxShadow: '0 6px 0 rgba(44,62,80,0.10)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: '1.5px solid var(--panel-border)' }}
      >
        <span className="text-sm font-black" style={{ color: '#7C3AED', fontFamily: 'Fredoka, Nunito, sans-serif' }}>
          Tidslinje — innstillinger
        </span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--ink-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--panel-bg-alt)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* ── Time window ──────────────────────────────────────────────────── */}
        <div
          className="rounded-xl p-3 flex flex-col gap-3"
          style={{ background: 'var(--panel-bg-alt)', border: '1.5px solid var(--panel-border)' }}
        >
          <span className="text-xs font-black tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
            Tidsvindu
          </span>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>Fra</label>
              <input type="time" value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
                onBlur={(e) => commitStart(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitStart(localStart) }}
                className="text-sm rounded-lg px-2 py-1.5 outline-none w-full"
                style={{ ...inputStyle, border: '2px solid var(--panel-border)' }}
              />
            </div>
            <div className="mt-4 font-bold" style={{ color: 'var(--ink-muted)' }}>→</div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>Til</label>
              <input type="time" value={localEnd}
                onChange={(e) => setLocalEnd(e.target.value)}
                onBlur={(e) => commitEnd(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEnd(localEnd) }}
                className="text-sm rounded-lg px-2 py-1.5 outline-none w-full"
                style={{ ...inputStyle, border: '2px solid var(--panel-border)' }}
              />
            </div>
          </div>
        </div>

        {/* ── Schedules ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
            Timeplaner
          </span>
          {schedules.map((sc) => (
            <ScheduleCard key={sc.id} schedule={sc} />
          ))}
          <button
            onClick={() => addSchedule({ id: `schedule-${Date.now()}`, name: 'Ny timeplan', days: [], entries: [] })}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all"
            style={{
              border: '2px dashed var(--panel-border)',
              color: 'var(--ink-muted)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#7C3AED'; e.currentTarget.style.borderColor = '#7C3AED' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-muted)'; e.currentTarget.style.borderColor = 'var(--panel-border)' }}
          >
            <Plus size={14} />
            Ny timeplan
          </button>
        </div>
      </div>
    </div>
  )
}
