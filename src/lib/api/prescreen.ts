// ============================================================
// WhiteStellar — Pre-Screen API
// src/lib/api/prescreen.ts
// ============================================================

import { supabase } from '../supabase'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token ?? ''}`,
  }
}

export async function createPrescreenSession(
  sessionId: string,
  advisorId: number,
  clientId: string,
) {
  const { data, error } = await supabase
    .from('prescreen_sessions')
    .insert({ session_id: sessionId, advisor_id: advisorId, client_id: clientId, conversation: [] })
    .select()
    .single()
  if (error) throw error
  return data as { id: string }
}

export async function sendPrescreenMessage(params: {
  prescreenSessionId: string
  clientMessage: string
  advisorName: string
  advisorCategory: string
  advisorSpecializations: string[]
  conversationHistory: { role: string; content: string }[]
}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${EDGE_FUNCTION_URL}/prescreen-agent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'message', ...params }),
  })
  if (!res.ok) throw new Error('Failed to send prescreen message')
  return res.json() as Promise<{ reply: string; shouldEvaluate: boolean; messageCount: number }>
}

export async function evaluateClient(params: {
  prescreenSessionId: string
  advisorName: string
  conversationHistory: { role: string; content: string }[]
}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${EDGE_FUNCTION_URL}/prescreen-agent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'evaluate', ...params }),
  })
  if (!res.ok) throw new Error('Evaluation failed')
  return res.json() as Promise<{
    intent_score: 'high' | 'medium' | 'low'
    score_reasoning: string
    recommended_opening: string
  }>
}

export async function checkShouldPrescreen(
  advisorId: number,
  clientId: string,
): Promise<boolean> {
  const { data: advisor } = await supabase
    .from('advisors')
    .select('prescreen_enabled, prescreen_session_range')
    .eq('id', advisorId)
    .single()

  if (!advisor?.prescreen_enabled) return false

  const { data: clientSessions } = await supabase
    .from('advisor_client_sessions')
    .select('session_count')
    .eq('advisor_id', advisorId)
    .eq('client_id', clientId)
    .single()

  const sessionCount = clientSessions?.session_count ?? 0
  return sessionCount < (advisor.prescreen_session_range ?? 1)
}
