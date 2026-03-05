// ============================================================
// WhiteStellar — Session Store
// src/store/sessionStore.ts
// ============================================================

import { create } from 'zustand'

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
}

interface SessionState {
  // Metadata
  sessionId: string | null
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
  endSession: () => void
  tickSecond: () => void
  toggleMute: () => void
  toggleCamera: () => void
  toggleHold: () => void
  addMessage: (message: ChatMessage) => void
  resetSession: () => void
}

// ─── Store ────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
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

  endSession: () => set({ status: 'ended' }),

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

  resetSession: () => set({
    sessionId: null,
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
