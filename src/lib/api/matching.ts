// ============================================================
// WhiteStellar — Matching Agent API
// src/lib/api/matching.ts
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

export async function createMatchingSession(userId: string | null) {
  const { data, error } = await supabase
    .from('matching_sessions')
    .insert({ user_id: userId, conversation: [] })
    .select()
    .single()
  if (error) throw error
  return data as { id: string }
}

export async function sendMatchingMessage(params: {
  matchingSessionId: string
  userMessage: string
  guidedAnswers: { gender: string | null; topic: string | null }
  conversationHistory: { role: string; content: string }[]
}) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${EDGE_FUNCTION_URL}/matching-agent`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'chat', ...params }),
  })
  if (!res.ok) throw new Error('Failed to send matching message')
  return res.json() as Promise<{
    reply: string
    recommendedAdvisorIds: number[]
    hasRecommendations: boolean
  }>
}
