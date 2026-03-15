// ============================================================
// WhiteStellar — Advisors API
// src/lib/api/advisors.ts
// ============================================================

import { supabase } from '../supabase'

export const getAdvisors = async (filters?: {
  categorySlug?: string
  status?: string
  sessionType?: string
  sortBy?: string
  limit?: number
}) => {
  let query = supabase
    .from('advisors')
    .select(`
      *,
      advisor_categories(category_id, categories(slug, title)),
      advisor_specializations(specialization_id, specializations(title)),
      advisor_skills(skill_id, skills_and_methods(title))
    `)
    .eq('account_status', 'active')

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.sessionType) query = query.contains('session_types', [filters.sessionType])
  if (filters?.sortBy === 'rating') query = query.order('rating', { ascending: false })
  if (filters?.sortBy === 'price_low') query = query.order('chat_price', { ascending: true })
  if (filters?.sortBy === 'price_high') query = query.order('chat_price', { ascending: false })
  if (!filters?.sortBy) query = query.order('is_top_advisor', { ascending: false })
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export const getAdvisorById = async (id: number) => {
  const { data, error } = await supabase
    .from('advisors')
    .select(`
      *,
      advisor_categories(category_id, categories(*)),
      advisor_specializations(specialization_id, specializations(*)),
      advisor_skills(skill_id, skills_and_methods(*)),
      advisor_languages(language_id, languages(*))
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getAdvisorReviews = async (advisorId: number) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('advisor_id', advisorId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export const updateAdvisorStatus = async (
  advisorId: number,
  status: 'online' | 'offline' | 'busy',
) => {
  const { error } = await supabase
    .from('advisors')
    .update({ status })
    .eq('id', advisorId)
  if (error) throw error
}

export const updateAdvisorProfile = async (
  advisorId: number,
  updates: Partial<Record<string, unknown>>,
) => {
  const { data, error } = await supabase
    .from('advisors')
    .update(updates)
    .eq('id', advisorId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('advisor_count', { ascending: false })
  if (error) throw error
  return data ?? []
}
