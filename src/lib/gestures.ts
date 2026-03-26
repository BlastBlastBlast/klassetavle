export interface Gesture {
  id: string
  emoji: string
  label: string
  sublabel: string
  color: string
}

export const GESTURES: Gesture[] = [
  { id: 'stille',   emoji: '🤫', label: 'Vær stille',        sublabel: 'Ingen lyd nå',           color: '#6366f1' },
  { id: 'snakk',    emoji: '🗣️', label: 'Snakk sammen',      sublabel: 'Diskuter med naboen',     color: '#22c55e' },
  { id: 'rekk',     emoji: '✋', label: 'Rekk opp hånden',   sublabel: 'Vil du si noe?',          color: '#f59e0b' },
  { id: 'jobb',     emoji: '✏️', label: 'Jobbe alene',       sublabel: 'Konsentrer deg',          color: '#3b82f6' },
  { id: 'lytt',     emoji: '👂', label: 'Lytt godt',         sublabel: 'Hør etter nå',            color: '#8b5cf6' },
  { id: 'se',       emoji: '👀', label: 'Se opp',             sublabel: 'Se på tavlen',            color: '#06b6d4' },
  { id: 'pause',    emoji: '☕', label: 'Pause',              sublabel: 'Hvil litt',               color: '#f97316' },
  { id: 'bra',      emoji: '👍', label: 'Bra jobbet!',        sublabel: 'Flott innsats!',          color: '#10b981' },
  { id: 'toalett',  emoji: '🚻', label: 'Toalett',            sublabel: 'Gå én om gangen',         color: '#64748b' },
  { id: 'pakk',     emoji: '🎒', label: 'Pakk sammen',        sublabel: 'Rydd og gjør deg klar',   color: '#7c3aed' },
  { id: 'ute',      emoji: '🌤️', label: 'Utetid',             sublabel: 'Ta på deg jakken',        color: '#0ea5e9' },
  { id: 'les',      emoji: '📖', label: 'Les stille',         sublabel: 'Lesetid nå',              color: '#ec4899' },
]
