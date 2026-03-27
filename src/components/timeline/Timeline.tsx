import { useEffect, useRef, useState, useCallback } from 'react'
import {
  useTimelineStore,
  BASE_PX_PER_MIN,
  ZOOM_LEVELS,
  timeToMinutes,
  minutesToTime,
  type DaySchedule,
} from '../../store/timelineStore'
import { TimelineSettings } from './TimelineSettings'
import { TYPE_COLOR } from './timelineConstants'

// ── Tick interval for ruler (minutes) ────────────────────────────────────────
function tickInterval(pxPerMin: number): number {
  if (pxPerMin >= 8)  return 5
  if (pxPerMin >= 4)  return 15
  if (pxPerMin >= 2)  return 30
  return 60
}

// ── Current time in minutes since midnight ───────────────────────────────────
function nowMinutes(): number {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60
}

// ── Pick today's schedule ─────────────────────────────────────────────────────
function todaySchedule(schedules: DaySchedule[]): DaySchedule | null {
  const day = new Date().getDay()
  return schedules.find((s) => s.days.includes(day)) ?? null
}

// ── Dimensions ────────────────────────────────────────────────────────────────
const RULER_H  = 20   // px — time ruler (sits at top of bar)
const BLOCK_H  = 22   // px — activity block strip below the ruler
export const TIMELINE_BAR_HEIGHT = RULER_H + BLOCK_H   // 42px total

export function Timeline() {
  const { visible, zoom, startTime, endTime, schedules, toggle, setZoom } = useTimelineStore()
  const [showSettings, setShowSettings] = useState(false)
  const [, forceUpdate] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStart  = useRef({ x: 0, scrollLeft: 0 })

  const startMin = timeToMinutes(startTime)
  const endMin   = timeToMinutes(endTime)
  const pxPerMin = zoom * BASE_PX_PER_MIN
  const totalW   = (endMin - startMin) * pxPerMin

  // Tick marker every second (animates the current-time marker)
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Re-centre on current time whenever zoom or time window changes
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const markerX = (nowMinutes() - startMin) * pxPerMin
    el.scrollLeft = markerX - el.clientWidth / 2
  }, [zoom, pxPerMin, startMin])

  const zoomIn  = useCallback(() => {
    const idx = ZOOM_LEVELS.indexOf(zoom as typeof ZOOM_LEVELS[number])
    if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1])
  }, [zoom, setZoom])

  const zoomOut = useCallback(() => {
    const idx = ZOOM_LEVELS.indexOf(zoom as typeof ZOOM_LEVELS[number])
    if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1])
  }, [zoom, setZoom])

  // Drag-to-pan
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!scrollRef.current) return
    isDragging.current = true
    dragStart.current = { x: e.clientX, scrollLeft: scrollRef.current.scrollLeft }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - (e.clientX - dragStart.current.x)
  }, [])
  const onPointerUp = useCallback(() => { isDragging.current = false }, [])

  // ── Collapsed ─────────────────────────────────────────────────────────────
  if (!visible) return null

  const schedule = todaySchedule(schedules)
  const entries  = schedule?.entries ?? []
  const now      = nowMinutes()
  const markerX  = (now - startMin) * pxPerMin
  const nowTime  = minutesToTime(Math.round(now))

  // Ruler ticks
  const interval = tickInterval(pxPerMin)
  const ticks: number[] = []
  for (let m = Math.ceil(startMin / interval) * interval; m <= endMin; m += interval) {
    ticks.push(m)
  }

  // Activity blocks — each entry spans until the next one (or end of window)
  const blocks = entries.map((entry, i) => {
    const start = timeToMinutes(entry.time)
    const end   = i + 1 < entries.length ? timeToMinutes(entries[i + 1].time) : endMin
    const x     = (start - startMin) * pxPerMin
    const w     = Math.max((end - start) * pxPerMin - 1, 4)
    return { entry, x, w }
  })

  return (
    <>
      {/* Settings panel — drops down below the bar */}
      {showSettings && (
        <TimelineSettings
          onClose={() => setShowSettings(false)}
          topOffset={TIMELINE_BAR_HEIGHT}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onToggle={toggle}
          zoom={zoom}
        />
      )}

      {/* Main bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[9998] flex flex-col select-none"
        style={{
          height: TIMELINE_BAR_HEIGHT,
          background: 'rgba(8,8,20,0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
          style={{ scrollbarWidth: 'none', cursor: isDragging.current ? 'grabbing' : 'grab' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <div className="relative" style={{ width: totalW, height: TIMELINE_BAR_HEIGHT, minWidth: totalW }}>

            {/* ── Ruler — very top ───────────────────────────────────────── */}
            <div className="absolute top-0 left-0 right-0" style={{ height: RULER_H }}>
              {ticks.map((m) => {
                const x       = (m - startMin) * pxPerMin
                const isHour  = m % 60 === 0
                return (
                  <div
                    key={m}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: x, transform: 'translateX(-50%)' }}
                  >
                    <div
                      className="bg-white/20"
                      style={{ width: 1, height: isHour ? 9 : 5, marginTop: isHour ? 0 : 4 }}
                    />
                    {(isHour || pxPerMin >= 4) && (
                      <span
                        className="text-white/40 font-mono"
                        style={{ fontSize: 9, marginTop: 1, whiteSpace: 'nowrap' }}
                      >
                        {minutesToTime(m)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Activity blocks — below ruler ──────────────────────────── */}
            <div
              className="absolute left-0 right-0"
              style={{ top: RULER_H, height: BLOCK_H }}
            >
              {blocks.map(({ entry, x, w }) => (
                <div
                  key={entry.id}
                  className="absolute top-0 bottom-0 flex items-center overflow-hidden"
                  style={{
                    left: x,
                    width: w,
                    background: TYPE_COLOR[entry.type] + '38',
                    borderLeft: `2px solid ${TYPE_COLOR[entry.type]}`,
                  }}
                  title={`${entry.time} — ${entry.label}`}
                >
                  {w > 28 && (
                    <span
                      className="pl-1 truncate font-medium leading-none"
                      style={{ fontSize: 9, color: TYPE_COLOR[entry.type] }}
                    >
                      {w > 52 ? entry.label : entry.time}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ── Current-time marker ────────────────────────────────────── */}
            {markerX >= 0 && markerX <= totalW && (
              <div
                className="absolute top-0 z-20 flex flex-col items-center pointer-events-none"
                style={{ left: markerX, height: TIMELINE_BAR_HEIGHT }}
              >
                {/* Tick at very top */}
                <div style={{
                  width: 0, height: 0,
                  borderLeft: '3px solid transparent',
                  borderRight: '3px solid transparent',
                  borderTop: '4px solid #f43f5e',
                }} />
                {/* Line */}
                <div className="flex-1 w-px" style={{ background: '#f43f5e', opacity: 0.9 }} />
                {/* Time badge at bottom edge */}
                <div
                  className="rounded-sm px-1 text-white font-mono font-bold leading-none"
                  style={{
                    fontSize: 9,
                    background: '#f43f5e',
                    whiteSpace: 'nowrap',
                    transform: 'translateX(-50%)',
                    paddingTop: 1,
                    paddingBottom: 1,
                  }}
                >
                  {nowTime}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
