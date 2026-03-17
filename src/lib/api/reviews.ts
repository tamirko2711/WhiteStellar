// ============================================================
// WhiteStellar — Reviews & Contact API
// src/lib/api/reviews.ts
// ============================================================

import { supabase } from '../supabase'

export const submitReview = async (params: {
  advisorId: number
  clientId: string
  clientName: string
  clientAvatar?: string
  rating: number
  comment: string
  sessionType: string
}) => {
  // Insert review (auto-approved for MVP)
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      advisor_id: params.advisorId,
      client_id: params.clientId,
      client_name: params.clientName,
      client_avatar: params.clientAvatar ?? null,
      rating: params.rating,
      comment: params.comment,
      session_type: params.sessionType,
      is_approved: true,
    })
    .select()
    .single()
  if (error) throw error

  // advisor rating + review_count are updated automatically by the
  // trg_sync_advisor_rating DB trigger (SECURITY DEFINER) — no client-side update needed.

  return data
}

export const saveAdvisorResponse = async (reviewId: number, responseText: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ advisor_response: responseText })
    .eq('id', reviewId)
    .select()
    .single()
  if (error) throw error
  return data  // DB trigger auto-inserts client notification
}

export const getAdminReviews = async () => {
  const { data, error } = await supabase.rpc('get_all_reviews_admin')
  if (error) throw error
  return data ?? []
}

export const submitContactForm = async (params: {
  requestType: string
  subject: string
  email: string
  message: string
}) => {
  const { error } = await supabase.from('contact_submissions').insert({
    request_type: params.requestType,
    subject: params.subject,
    email: params.email,
    message: params.message,
  })
  if (error) throw error
}
