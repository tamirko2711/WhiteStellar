// ============================================================
// WhiteStellar — Supabase Client
// src/lib/supabase.ts
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || supabaseUrl.startsWith('your_') || !supabaseAnonKey || supabaseAnonKey.startsWith('your_')) {
  console.warn(
    '[WhiteStellar] Supabase env vars not configured.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n' +
    'The app will run in demo mode with static data only.'
  )
}

// Use safe fallback values so createClient doesn't throw on invalid URLs
export const supabase = createClient(
  supabaseUrl?.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey?.startsWith('your_') ? 'placeholder-key' : (supabaseAnonKey ?? 'placeholder-key'),
)
