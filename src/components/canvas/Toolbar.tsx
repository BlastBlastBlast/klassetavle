import React, { useState, useEffect } from 'react'
import { Trash2, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import { useThemeStore } from '../../store/themeStore'
import type { WidgetType } from '../../store/boardStore'

const TOOLS: {
  type: WidgetType
  emoji: string
  label: string
  bgLight: string
  bgDark: string
  border: string
}[] = [
  { type: 'trafikklys', emoji: '🚦', label: 'Trafikklys', bgLight: '#FFF3BF', bgDark: '#3A320F', border: '#FFD43B' },
  { type: 'tekst',      emoji: '✏️', label: 'Tekst',      bgLight: '#E7F5FF', bgDark: '#0D2137', border: '#74C0FC' },
  { type: 'bilde',      emoji: '🖼️', label: 'Bilde',      bgLight: '#FFF0F6', bgDark: '#37102A', border: '#F783AC' },
  { type: 'klokke',     emoji: '🕐', label: 'Klokke',     bgLight: '#F3F0FF', bgDark: '#21183D', border: '#9775FA' },
  { type: 'terning',    emoji: '🎲', label: 'Terning',    bgLight: '#E6FCF5', bgDark: '#0A2E24', border: '#20C997' },
  { type: 'timer',      emoji: '⏱️', label: 'Timer',      bgLight: '#FFF4E6', bgDark: '#3A1F07', border: '#FF922B' },
  { type: 'snurrehjul', emoji: '🎡', label: 'Snurrehjul', bgLight: '#F0FFF4', bgDark: '#0E2E16', border: '#51CF66' },
  { type: 'tegning',    emoji: '🎨', label: 'Tegning',    bgLight: '#FFF0F6', bgDark: '#30103A', border: '#CC5DE8' },
  { type: 'bakgrunn',   emoji: '🖼',  label: 'Bakgrunn',   bgLight: '#E7F5FF', bgDark: '#0D2137', border: '#339AF0' },
  { type: 'gestu',      emoji: '👋', label: 'Gestus',     bgLight: '#FFF9DB', bgDark: '#332B07', border: '#FAB005' },
]

export function Toolbar() {
  const { addWidget, clearBoard, widgets, background } = useBoardStore()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  const [collapsed, setCollapsed] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  // Auto-collapse on small screens
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 640) setCollapsed(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setJustSaved(true)
      const f = setTimeout(() => setJustSaved(false), 2000)
      return () => clearTimeout(f)
    }, 600)
    return () => clearTimeout(t)
  }, [widgets, background])

  return (
    <div
      className="fixed left-0 top-0 h-full z-[9999] flex items-center"
      style={{ pointerEvents: 'none' }}
    >
      {/*
       * This wrapper translates as ONE UNIT — panel + toggle tab move together.
       * When collapsed: -translate-x-full shifts everything left by the panel's
       * width, leaving only the tab button (positioned right: -26 outside the
       * wrapper's right edge) peeking in from the screen's left edge.
       */}
      <div
        className={`relative transition-all duration-300 ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{ pointerEvents: 'auto' }}
      >

        {/* ── Main panel ──────────────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-1.5 py-3 px-2"
          style={{
            background: 'var(--panel-bg)',
            border: '2.5px solid var(--panel-border)',
            borderLeft: 'none',
            borderRadius: '0 20px 20px 0',
            boxShadow: 'var(--shadow-md)',
            minWidth: '72px',
            // Never taller than the viewport — scroll internally if needed
            maxHeight: 'calc(100vh - 1rem)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Logo label */}
          <div className="text-center mb-1 px-1">
            <span className="text-xs font-black tracking-wide" style={{ color: '#7C3AED' }}>
              🏫 SKOLE
            </span>
          </div>

          {/* Tool buttons */}
          {TOOLS.map((tool) => (
            <button
              key={tool.type}
              onClick={() => addWidget(tool.type)}
              title={tool.label}
              className="group flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all duration-150 active:scale-95"
              style={{
                background: isDark ? tool.bgDark : tool.bgLight,
                border: `2px solid ${tool.border}`,
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-1px, -1px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <span className="text-xl leading-none">{tool.emoji}</span>
              <span className="text-[9px] font-bold leading-none" style={{ color: tool.border }}>
                {tool.label}
              </span>
            </button>
          ))}

          {/* Divider */}
          <div className="h-0.5 rounded-full mx-1 my-0.5" style={{ background: 'var(--panel-border)' }} />

          {/* Clear board */}
          {showConfirmClear ? (
            <div className="flex flex-col gap-1 px-1 py-1">
              <span className="text-[10px] font-bold text-center" style={{ color: 'var(--ink-soft)' }}>
                Sikker?
              </span>
              <button
                onClick={() => { clearBoard(); setShowConfirmClear(false) }}
                className="text-xs font-bold px-2 py-1 rounded-xl transition-colors"
                style={{ background: '#FFF0F0', color: '#F03E3E', border: '2px solid #F03E3E' }}
              >
                Ja
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="text-xs font-bold px-2 py-1 rounded-xl"
                style={{ background: 'var(--panel-bg-alt)', color: 'var(--ink-soft)', border: '2px solid var(--panel-border)' }}
              >
                Nei
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              title="Tøm tavlen"
              className="group flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all"
              style={{ background: isDark ? '#2A1515' : '#FFF5F5', border: '2px solid #FFB8B8' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFE3E3'
                e.currentTarget.style.borderColor = '#F03E3E'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? '#2A1515' : '#FFF5F5'
                e.currentTarget.style.borderColor = '#FFB8B8'
              }}
            >
              <Trash2 size={16} style={{ color: '#F03E3E' }} />
              <span className="text-[9px] font-bold" style={{ color: '#F03E3E' }}>Tøm</span>
            </button>
          )}

          {/* Divider */}
          <div className="h-0.5 rounded-full mx-1" style={{ background: 'var(--panel-border)' }} />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Lysmodus' : 'Mørk modus'}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all active:scale-95"
            style={{
              background: isDark ? '#2A2340' : '#FFFDE7',
              border: `2px solid ${isDark ? '#7C3AED' : '#FAB005'}`,
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-1px, -1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
          >
            {isDark
              ? <Sun  size={16} style={{ color: '#FAB005' }} />
              : <Moon size={16} style={{ color: '#7C3AED' }} />
            }
            <span className="text-[9px] font-bold" style={{ color: isDark ? '#FAB005' : '#7C3AED' }}>
              {isDark ? 'Lys' : 'Mørk'}
            </span>
          </button>

          {/* Save status */}
          <div className="flex items-center justify-center pb-1 min-h-[20px]">
            {justSaved ? (
              <span className="text-[9px] font-bold animate-wiggle" style={{ color: '#20C997' }}>
                ✓ Lagret
              </span>
            ) : (
              <span className="text-[9px] font-bold" style={{ color: 'var(--ink-muted)' }}>
                💾 lokalt
              </span>
            )}
          </div>
        </div>

        {/* ── Collapse tab ─────────────────────────────────────────────────────
         *  Positioned right: -26 on the WRAPPER (not the panel alone), so it
         *  translates with the wrapper. When collapsed the tab remains visible
         *  as a small handle peeking out from the left edge of the screen.
         * ──────────────────────────────────────────────────────────────────── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute flex items-center justify-center transition-all"
          style={{
            right: -26,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 26,
            height: 48,
            background: 'var(--panel-bg)',
            border: '2.5px solid var(--panel-border)',
            borderLeft: 'none',
            borderRadius: '0 12px 12px 0',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {collapsed
            ? <ChevronRight size={14} style={{ color: '#7C3AED' }} />
            : <ChevronLeft  size={14} style={{ color: '#7C3AED' }} />
          }
        </button>

      </div>
    </div>
  )
}
