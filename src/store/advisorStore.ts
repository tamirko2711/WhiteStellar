import { create } from 'zustand'

interface AdvisorState {
  availability: 'online' | 'busy' | 'offline'
  setAvailability: (status: 'online' | 'busy' | 'offline') => void
}

export const useAdvisorStore = create<AdvisorState>(set => ({
  availability: 'online',
  setAvailability: (availability) => set({ availability }),
}))
