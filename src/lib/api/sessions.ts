// ============================================================
// WhiteStellar — Sessions API
// src/lib/api/sessions.ts
// ============================================================

import { supabase } from '../supabase'

export const createSession = async (params: {
  advisorId: number
  clientId: string
  sessionType: 'chat' | 'audio' | 'video'
  pricePerMinute: number
}) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      advisor_id: params.advisorId,
      client_id: params.clientId,
      session_type: params.sessionType,
      price_per_minute: params.pricePerMinute,
      status: 'in_progress',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export const endSession = async (
  sessionId: string,
  durationSeconds: number,
  totalCost: number,
) => {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      duration_seconds: durationSeconds,
      total_cost: totalCost,
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getClientSessions = async (clientId: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, advisors(full_name, avatar_url)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const getAdvisorSessions = async (advisorId: number) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, profiles(full_name, avatar_url)')
    .eq('advisor_id', advisorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
