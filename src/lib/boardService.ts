import { supabase } from './supabase'
import type { BoardRow } from './supabase'

export async function listBoards(): Promise<Omit<BoardRow, 'data'>[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('boards')
    .select('id, user_id, name, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data ?? []
}

export async function loadBoard(id: string): Promise<BoardRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { console.error(error); return null }
  return data
}

export async function saveBoard(
  id: string | null,
  name: string,
  boardData: Record<string, unknown>
): Promise<BoardRow | null> {
  if (!supabase) return null

  if (id) {
    // Update existing
    const { data, error } = await supabase
      .from('boards')
      .update({ name, data: boardData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) { console.error(error); return null }
    return data
  } else {
    // Create new
    const { data, error } = await supabase
      .from('boards')
      .insert({ name, data: boardData })
      .select()
      .single()
    if (error) { console.error(error); return null }
    return data
  }
}

export async function deleteBoard(id: string): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('boards').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  if (!supabase) return null
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('images').upload(path, file)
  if (error) { console.error(error); return null }
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}
