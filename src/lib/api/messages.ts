// ============================================================
// WhiteStellar — Messages API
// src/lib/api/messages.ts
// ============================================================

import { supabase } from '../supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const sendMessage = async (
  sessionId: string,
  senderId: string,
  senderType: string,
  content: string,
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ session_id: sessionId, sender_id: senderId, sender_type: senderType, content })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getSessionMessages = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(full_name, avatar_url)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export const subscribeToMessages = (
  sessionId: string,
  callback: (message: unknown) => void,
): RealtimeChannel => {
  return supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => callback(payload.new),
    )
    .subscribe()
}
