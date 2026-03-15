// ============================================================
// WhiteStellar — Session Store
// src/store/sessionStore.ts
// ============================================================

import { create } from 'zustand'
import { deductFromWallet } from '../lib/api/wallet'
import { endSession as endSessionAPI } from '../lib/api/sessions'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

// ─── Types ────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  senderId: string | number
  senderName: string
  senderAvatar: string
  text: string
  timestamp: string
  isSystem?: boolean
}

export interface StartSessionParams {
  sessionType: 'chat' | 'audio' | 'video'
  clientId: string
  clientName: string
  clientAvatar: string
  advisorId: number
  advisorName: string
  advisorAvatar: string
  pricePerMinute: number
  walletBalance: number
  isNewClient?: boolean
  supabaseSessionId?: number | null
}

interface SessionState {
  // Metadata
  sessionId: string | null
  supabaseSessionId: number | null
  sessionType: 'chat' | 'audio' | 'video' | null
  status: 'idle' | 'requesting' | 'connecting' | 'active' | 'ending' | 'ended'

  // Participants
  clientId: string | null
  advisorId: number | null
  clientName: string
  clientAvatar: string
  advisorName: string
  advisorAvatar: string

  // Billing
  pricePerMinute: number
  elapsedSeconds: number
  totalCost: number
  walletBalance: number
  freeSecondsRemaining: number
  initialFreeSeconds: number

  // Controls
  isMuted: boolean
  isCameraOff: boolean
  isOnHold: boolean

  // Messages
  messages: ChatMessage[]

  // Actions
  startSession: (params: StartSessionParams) => void
  setActive: () => void
  endSession: () => Promise<void>
  tickSecond: () => void
  toggleMute: () => void
  toggleCamera: () => void
  toggleHold: () => void
  addMessage: (message: ChatMessage) => void
  resetSession: () => void
  setEnded: () => void
}

// ─── Store ────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  supabaseSessionId: null,
  sessionType: null,
  status: 'idle',

  clientId: null as string | null,
  advisorId: null,
  clientName: '',
  clientAvatar: '',
  advisorName: '',
  advisorAvatar: '',

  pricePerMinute: 0,
  elapsedSeconds: 0,
  totalCost: 0,
  walletBalance: 0,
  freeSecondsRemaining: 0,
  initialFreeSeconds: 0,

  isMuted: false,
  isCameraOff: false,
  isOnHold: false,

  messages: [],

  startSession: (params) => {
    const freeSeconds = params.isNewClient ? 180 : 0
    set({
      sessionId: `session-${Date.now()}`,
      supabaseSessionId: params.supabaseSessionId ?? null,
      sessionType: params.sessionType,
      status: 'connecting',
      clientId: params.clientId,
      clientName: params.clientName,
      clientAvatar: params.clientAvatar,
      advisorId: params.advisorId,
      advisorName: params.advisorName,
      advisorAvatar: params.advisorAvatar,
      pricePerMinute: params.pricePerMinute,
      walletBalance: params.walletBalance,
      freeSecondsRemaining: freeSeconds,
      initialFreeSeconds: freeSeconds,
      elapsedSeconds: 0,
      totalCost: 0,
      isMuted: false,
      isCameraOff: false,
      isOnHold: false,
      messages: [],
    })
  },

  setActive: () => set({ status: 'active' }),

  endSession: async () => {
    const state = get()
    // Deduct session cost from wallet if there was a billable charge
    if (state.totalCost > 0 && state.clientId && state.sessionId) {
      try {
        const newBalance = await deductFromWallet(
          state.clientId,
          state.totalCost,
          `Session with ${state.advisorName}`,
        )
        useAuthStore.getState().updateWalletBalance(newBalance)
      } catch (err) {
        console.error('Failed to deduct session cost from wallet:', err)
      }
    }

    // Persist session completion to Supabase
    if (state.supabaseSessionId) {
      try {
        await endSessionAPI(state.supabaseSessionId, state.elapsedSeconds, state.totalCost)
      } catch (err) {
        console.error('Failed to end session in Supabase:', err)
      }

      // Increment advisor total_sessions
      if (state.advisorId) {
        try {
          const { data: adv } = await supabase
            .from('advisors')
            .select('total_sessions')
            .eq('id', state.advisorId)
            .single()
          if (adv) {
            await supabase
              .from('advisors')
              .update({ total_sessions: (adv.total_sessions ?? 0) + 1 })
              .eq('id', state.advisorId)
          }
        } catch (err) {
          console.error('Failed to increment total_sessions:', err)
        }
      }
    }

    set({ status: 'ended' })
  },

  tickSecond: () => {
    const state = get()
    if (state.status !== 'active') return

    const newElapsed = state.elapsedSeconds + 1
    let newFreeSeconds = state.freeSecondsRemaining
    let newCost = state.totalCost

    if (newFreeSeconds > 0) {
      newFreeSeconds -= 1
    } else {
      newCost = Math.round((state.totalCost + state.pricePerMinute / 60) * 100) / 100
    }

    // Balance exhausted → trigger ending state
    if (newFreeSeconds === 0 && newCost >= state.walletBalance && state.walletBalance > 0) {
      set({ elapsedSeconds: newElapsed, freeSecondsRemaining: 0, totalCost: newCost, status: 'ending' })
      return
    }

    set({ elapsedSeconds: newElapsed, freeSecondsRemaining: newFreeSeconds, totalCost: newCost })
  },

  toggleMute: () => set(s => ({ isMuted: !s.isMuted })),
  toggleCamera: () => set(s => ({ isCameraOff: !s.isCameraOff })),
  toggleHold: () => set(s => ({ isOnHold: !s.isOnHold })),

  addMessage: (message) => set(s => ({ messages: [...s.messages, message] })),

  setEnded: () => set({ status: 'ended' }),

  resetSession: () => set({
    sessionId: null,
    supabaseSessionId: null,
    sessionType: null,
    status: 'idle',
    clientId: null,
    advisorId: null,
    clientName: '',
    clientAvatar: '',
    advisorName: '',
    advisorAvatar: '',
    pricePerMinute: 0,
    elapsedSeconds: 0,
    totalCost: 0,
    walletBalance: 0,
    freeSecondsRemaining: 0,
    initialFreeSeconds: 0,
    isMuted: false,
    isCameraOff: false,
    isOnHold: false,
    messages: [],
  }),
}))
