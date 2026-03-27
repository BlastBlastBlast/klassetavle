import type { EntryType } from '../../store/timelineStore'

export const TYPE_COLOR: Record<EntryType, string> = {
  fag:       '#3b82f6',
  friminutt: '#22c55e',
  frukt:     '#f97316',
  spising:   '#eab308',
  storefri:  '#14b8a6',
  aks:       '#a855f7',
  special:   '#ef4444',
  custom:    '#6b7280',
}

export const TYPE_LABEL: Record<EntryType, string> = {
  fag:       'Fag',
  friminutt: 'Friminutt',
  frukt:     'Frukt',
  spising:   'Spising',
  storefri:  'Storefri',
  aks:       'AKS',
  special:   'Spesielt',
  custom:    'Egendefinert',
}
