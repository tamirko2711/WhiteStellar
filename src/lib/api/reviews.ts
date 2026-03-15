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

  // Recalculate advisor rating from all approved reviews
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('advisor_id', params.advisorId)
    .eq('is_approved', true)

  if (allReviews && allReviews.length > 0) {
    const newAvg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    await supabase
      .from('advisors')
      .update({
        rating: Math.round(newAvg * 10) / 10,
        review_count: allReviews.length,
      })
      .eq('id', params.advisorId)
  }

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
