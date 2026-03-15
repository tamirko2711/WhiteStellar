// ============================================================
// WhiteStellar — Advisor Profile API
// src/lib/api/advisorProfile.ts
// ============================================================

import { supabase } from '../supabase'

export interface AdvisorRecord {
  id: number
  user_id: string
  full_name: string
  short_bio: string | null
  long_bio: string | null
  avatar: string | null
  background_image: string | null
  status: 'online' | 'offline' | 'busy'
  account_status: string
  chat_price: number | null
  audio_price: number | null
  video_price: number | null
  rating: number
  review_count: number
  total_sessions: number
  prescreen_enabled: boolean
  prescreen_session_range: number
}

// ─── Fetch ─────────────────────────────────────────────────

export const getAdvisorByUserId = async (userId: string): Promise<AdvisorRecord | null> => {
  const { data } = await supabase
    .from('advisors')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data as AdvisorRecord | null
}

export const getAdvisorJunctions = async (advisorId: number) => {
  const [cats, specs, skills, langs] = await Promise.all([
    supabase.from('advisor_categories').select('category_id').eq('advisor_id', advisorId),
    supabase.from('advisor_specializations').select('specialization_id').eq('advisor_id', advisorId),
    supabase.from('advisor_skills').select('skill_id').eq('advisor_id', advisorId),
    supabase.from('advisor_languages').select('language_id').eq('advisor_id', advisorId),
  ])
  return {
    categoryIds: (cats.data ?? []).map((r: { category_id: number }) => r.category_id),
    specializationIds: (specs.data ?? []).map((r: { specialization_id: number }) => r.specialization_id),
    skillIds: (skills.data ?? []).map((r: { skill_id: number }) => r.skill_id),
    languageIds: (langs.data ?? []).map((r: { language_id: number }) => r.language_id),
  }
}

// ─── Save ──────────────────────────────────────────────────

export interface AdvisorProfilePayload {
  fullName: string
  shortBio: string
  longBio: string
  chatPrice: number | null
  audioPrice: number | null
  videoPrice: number | null
  categoryIds: number[]
  specializationIds: number[]
  skillIds: number[]
  languageIds: number[]
  avatar?: string
  backgroundImage?: string
}

export const saveAdvisorProfile = async (
  userId: string,
  payload: AdvisorProfilePayload,
): Promise<AdvisorRecord> => {
  // Upsert core advisor row (insert if not exists, update if exists)
  const { data: existing } = await supabase
    .from('advisors')
    .select('id')
    .eq('user_id', userId)
    .single()

  let advisorId: number

  if (existing?.id) {
    // UPDATE
    const updatePayload: Record<string, unknown> = {
      full_name: payload.fullName,
      short_bio: payload.shortBio,
      long_bio: payload.longBio,
      chat_price: payload.chatPrice,
      audio_price: payload.audioPrice,
      video_price: payload.videoPrice,
      updated_at: new Date().toISOString(),
    }
    if (payload.avatar !== undefined && payload.avatar !== '') updatePayload.avatar = payload.avatar
    if (payload.backgroundImage !== undefined && payload.backgroundImage !== '') updatePayload.background_image = payload.backgroundImage

    const { data, error } = await supabase
      .from('advisors')
      .update(updatePayload)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    advisorId = (data as AdvisorRecord).id
  } else {
    // INSERT
    const { data, error } = await supabase
      .from('advisors')
      .insert({
        user_id: userId,
        full_name: payload.fullName,
        short_bio: payload.shortBio,
        long_bio: payload.longBio,
        chat_price: payload.chatPrice,
        audio_price: payload.audioPrice,
        video_price: payload.videoPrice,
        status: 'offline',
        account_status: 'pending',
        ...(payload.avatar ? { avatar: payload.avatar } : {}),
        ...(payload.backgroundImage ? { background_image: payload.backgroundImage } : {}),
      })
      .select()
      .single()
    if (error) throw error
    advisorId = (data as AdvisorRecord).id
  }

  // Replace junction tables
  await Promise.all([
    supabase.from('advisor_categories').delete().eq('advisor_id', advisorId),
    supabase.from('advisor_specializations').delete().eq('advisor_id', advisorId),
    supabase.from('advisor_skills').delete().eq('advisor_id', advisorId),
    supabase.from('advisor_languages').delete().eq('advisor_id', advisorId),
  ])

  const inserts = []
  if (payload.categoryIds.length)
    inserts.push(supabase.from('advisor_categories').insert(payload.categoryIds.map(id => ({ advisor_id: advisorId, category_id: id }))))
  if (payload.specializationIds.length)
    inserts.push(supabase.from('advisor_specializations').insert(payload.specializationIds.map(id => ({ advisor_id: advisorId, specialization_id: id }))))
  if (payload.skillIds.length)
    inserts.push(supabase.from('advisor_skills').insert(payload.skillIds.map(id => ({ advisor_id: advisorId, skill_id: id }))))
  if (payload.languageIds.length)
    inserts.push(supabase.from('advisor_languages').insert(payload.languageIds.map(id => ({ advisor_id: advisorId, language_id: id }))))

  if (inserts.length) {
    const results = await Promise.all(inserts)
    results.forEach((r, i) => {
      if (r.error) console.error(`[WhiteStellar] junction insert[${i}] failed:`, r.error)
    })
  }

  // Return fresh row
  const { data: fresh } = await supabase.from('advisors').select('*').eq('id', advisorId).single()
  return fresh as AdvisorRecord
}

// ─── Update profile image URLs ─────────────────────────────

export const updateAdvisorImages = async (
  userId: string,
  images: { avatar?: string; backgroundImage?: string },
) => {
  const updateObj: Record<string, string> = {}
  if (images.avatar) updateObj.avatar = images.avatar
  if (images.backgroundImage) updateObj.background_image = images.backgroundImage

  const { error } = await supabase
    .from('advisors')
    .update(updateObj)
    .eq('user_id', userId)
  if (error) throw error
}
