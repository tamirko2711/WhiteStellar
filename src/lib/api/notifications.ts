// ============================================================
// WhiteStellar — Notifications API
// src/lib/api/notifications.ts
// ============================================================

import { supabase } from '../supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data ?? []
}

export const markAllRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
  if (error) throw error
}

export const subscribeToNotifications = (
  userId: string,
  callback: (notification: unknown) => void,
): RealtimeChannel => {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload.new),
    )
    .subscribe()
}
