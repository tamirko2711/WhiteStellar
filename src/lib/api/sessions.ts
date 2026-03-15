// ============================================================
// WhiteStellar — Sessions API
// src/lib/api/sessions.ts
// ============================================================

import { supabase } from '../supabase'

export const createSession = async (params: {
  advisorId: number
  advisorName: string
  clientId: string
  clientName: string
  sessionType: 'chat' | 'audio' | 'video'
  pricePerMinute: number
}) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      advisor_id: params.advisorId,
      advisor_name: params.advisorName,
      client_id: params.clientId,
      client_name: params.clientName,
      type: params.sessionType,
      price_per_minute: params.pricePerMinute,
      status: 'pending',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateSessionStatus = async (
  sessionId: number,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
) => {
  const { error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)
  if (error) throw error
}

export const endSession = async (
  sessionId: number,
  durationSeconds: number,
  totalCost: number,
) => {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      duration_minutes: Math.ceil(durationSeconds / 60),
      total_cost: totalCost,
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const markSessionReviewed = async (sessionId: number) => {
  const { error } = await supabase
    .from('sessions')
    .update({ has_review: true })
    .eq('id', sessionId)
  if (error) throw error
}

export const getClientSessions = async (clientId: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, advisors(full_name, avatar)')
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
