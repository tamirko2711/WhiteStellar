// ============================================================
// WhiteStellar — Reviews & Contact API
// src/lib/api/reviews.ts
// ============================================================

import { supabase } from '../supabase'

export const submitReview = async (params: {
  advisorId: number
  clientId: string
  sessionId: string
  rating: number
  comment: string
  sessionType: string
}) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      advisor_id: params.advisorId,
      client_id: params.clientId,
      session_id: params.sessionId,
      rating: params.rating,
      comment: params.comment,
      session_type: params.sessionType,
      is_approved: false,
    })
    .select()
    .single()
  if (error) throw error
  return data
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
