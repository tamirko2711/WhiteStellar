// ============================================================
// WhiteStellar — Live Sessions API
// src/lib/api/liveSessions.ts
// ============================================================

import { supabase } from '../supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface LiveSession {
  id: string
  advisor_id: string
  client_id: string | null
  session_type: 'chat' | 'audio' | 'video'
  status: 'waiting' | 'active' | 'ended'
  price_per_minute: number
  created_at: string
  ended_at: string | null
}

export interface LiveMessage {
  id: string
  session_id: string
  sender_id: string
  content: string
  created_at: string
}

// ─── Session management ────────────────────────────────────

export const createLiveSession = async (
  advisorId: string,
  sessionType: 'chat' | 'audio' | 'video' = 'chat',
  pricePerMinute = 0,
): Promise<LiveSession> => {
  const { data, error } = await supabase
    .from('live_sessions')
    .insert({
      advisor_id: advisorId,
      session_type: sessionType,
      price_per_minute: pricePerMinute,
      status: 'waiting',
    })
    .select()
    .single()
  if (error) throw error
  return data as LiveSession
}

export const getLiveSession = async (sessionId: string): Promise<LiveSession | null> => {
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  if (error) return null
  return data as LiveSession
}

export const joinLiveSession = async (
  sessionId: string,
  clientId: string,
): Promise<LiveSession> => {
  const { data, error } = await supabase
    .from('live_sessions')
    .update({ client_id: clientId, status: 'active' })
    .eq('id', sessionId)
    .eq('status', 'waiting')
    .select()
    .single()
  if (error) throw error
  return data as LiveSession
}

export const endLiveSession = async (sessionId: string): Promise<void> => {
  const { error } = await supabase
    .from('live_sessions')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (error) throw error
}

export const getAdvisorActiveSessions = async (
  advisorId: string,
): Promise<LiveSession[]> => {
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('advisor_id', advisorId)
    .in('status', ['waiting', 'active'])
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as LiveSession[]
}

// ─── Messages ──────────────────────────────────────────────

export const sendLiveMessage = async (
  sessionId: string,
  senderId: string,
  content: string,
): Promise<LiveMessage> => {
  const { data, error } = await supabase
    .from('live_messages')
    .insert({ session_id: sessionId, sender_id: senderId, content })
    .select()
    .single()
  if (error) throw error
  return data as LiveMessage
}

export const getLiveMessages = async (sessionId: string): Promise<LiveMessage[]> => {
  const { data, error } = await supabase
    .from('live_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) return []
  return (data ?? []) as LiveMessage[]
}

// ─── Realtime subscriptions ────────────────────────────────

export const subscribeToLiveSession = (
  sessionId: string,
  callback: (session: LiveSession) => void,
): RealtimeChannel => {
  return supabase
    .channel(`live_session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => callback(payload.new as LiveSession),
    )
    .subscribe()
}

export const subscribeToLiveMessages = (
  sessionId: string,
  callback: (message: LiveMessage) => void,
): RealtimeChannel => {
  return supabase
    .channel(`live_messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'live_messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => callback(payload.new as LiveMessage),
    )
    .subscribe()
}

// ─── Get user profile name + avatar for display ────────────

export const getUserProfile = async (userId: string): Promise<{ full_name: string; avatar_url: string | null }> => {
  const { data } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .single()
  return data ?? { full_name: 'Unknown', avatar_url: null }
}
