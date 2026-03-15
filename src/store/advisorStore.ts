import { create } from 'zustand'

export interface IncomingSessionInfo {
  id: number
  clientId: string
  clientName: string
  sessionType: 'chat' | 'audio' | 'video'
  pricePerMinute: number
}

interface AdvisorState {
  availability: 'online' | 'busy' | 'offline'
  setAvailability: (status: 'online' | 'busy' | 'offline') => void

  // Advisor's DB row id (from advisors table) — set once on login
  advisorDbId: number | null
  setAdvisorDbId: (id: number | null) => void

  // Pending incoming session request
  incomingSession: IncomingSessionInfo | null
  countdown: number
  setIncomingSession: (session: IncomingSessionInfo) => void
  clearIncomingSession: () => void
  tickCountdown: () => void
}

export const useAdvisorStore = create<AdvisorState>(set => ({
  availability: 'online',
  setAvailability: (availability) => set({ availability }),

  advisorDbId: null,
  setAdvisorDbId: (advisorDbId) => set({ advisorDbId }),

  incomingSession: null,
  countdown: 120,
  setIncomingSession: (incomingSession) => set({ incomingSession, countdown: 120 }),
  clearIncomingSession: () => set({ incomingSession: null, countdown: 120 }),
  tickCountdown: () => set(s => ({ countdown: Math.max(0, s.countdown - 1) })),
}))
