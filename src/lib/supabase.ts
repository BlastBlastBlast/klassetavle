import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Returns null if env vars are not set (local dev without backend)
export const supabase = url && key ? createClient(url, key) : null

export type SupabaseClient = NonNullable<typeof supabase>

export interface BoardRow {
  id: string
  user_id: string
  name: string
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}
