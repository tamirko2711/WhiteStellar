import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { signIn, signUp, signOut } from '../lib/api/auth'

export interface AuthUser {
  id: string
  fullName: string
  avatar: string
  walletBalance: number
  email: string
}

interface AuthState {
  isLoggedIn: boolean
  isLoading: boolean
  userType: 'client' | 'advisor' | 'superadmin' | null
  user: AuthUser | null
  supabaseUser: unknown
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, userType: 'client' | 'advisor') => Promise<void>
  logout: () => Promise<void>
  updateWalletBalance: (amount: number) => void
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isLoading: true,
  userType: null,
  user: null,
  supabaseUser: null,

  initialize: async () => {
    set({ isLoading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ supabaseUser: session.user })
        await get().refreshProfile()
      }
    } catch (err) {
      console.error('Auth initialize error:', err)
    } finally {
      set({ isLoading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ supabaseUser: session.user })
        await get().refreshProfile()
      } else {
        set({ isLoggedIn: false, user: null, userType: null, supabaseUser: null })
      }
    })
  },

  login: async (email, password) => {
    await signIn(email, password)
    await get().refreshProfile()
  },

  register: async (email, password, fullName, userType) => {
    await signUp(email, password, fullName, userType)
  },

  logout: async () => {
    await signOut()
    set({ isLoggedIn: false, user: null, userType: null, supabaseUser: null })
  },

  updateWalletBalance: (amount) =>
    set(state =>
      state.user ? { user: { ...state.user, walletBalance: amount } } : {}
    ),

  refreshProfile: async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (!supabaseUser) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_type, wallet_balance')
        .eq('id', supabaseUser.id)
        .single()

      if (!profile) return

      set({
        isLoggedIn: true,
        userType: profile.user_type as 'client' | 'advisor' | 'superadmin',
        user: {
          id: supabaseUser.id,
          fullName: profile.full_name ?? '',
          avatar: profile.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name ?? 'User')}&background=1E2D45&color=C9A84C`,
          walletBalance: profile.wallet_balance ?? 0,
          email: supabaseUser.email ?? '',
        },
      })
    } catch (err) {
      console.error('refreshProfile error:', err)
    }
  },
}))
