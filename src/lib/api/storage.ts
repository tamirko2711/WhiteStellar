// ============================================================
// WhiteStellar — Storage API
// src/lib/api/storage.ts
// ============================================================

import { supabase } from '../supabase'

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export const uploadBackground = async (advisorId: number, file: File): Promise<string> => {
  const ext = file.name.split('.').pop()
  const path = `${advisorId}/background.${ext}`
  const { error } = await supabase.storage
    .from('backgrounds')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('backgrounds').getPublicUrl(path)
  return data.publicUrl
}
