// ============================================================
// WhiteStellar — Zodiac AI Store
// src/store/zodiacStore.ts
// ============================================================

import { create } from 'zustand'

export interface ZodiacMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface BirthDetails {
  name: string
  dob: string        // YYYY-MM-DD
  birthTime: string  // HH:mm or ''
  birthPlace: string
}

export type ReadingType =
  | 'love'
  | 'career'
  | 'spiritual'
  | 'horoscope'
  | 'compatibility'
  | 'life-path'

interface ZodiacState {
  // Step: 1 = birth details, 2 = reading type, 3 = result
  step: 1 | 2 | 3
  birthDetails: BirthDetails
  readingType: ReadingType | null
  messages: ZodiacMessage[]
  isLoading: boolean
  freeQuestionsLeft: number

  setBirthDetails: (details: BirthDetails) => void
  setReadingType: (type: ReadingType) => void
  setStep: (step: 1 | 2 | 3) => void
  addMessage: (msg: ZodiacMessage) => void
  setLoading: (v: boolean) => void
  decrementFreeQuestions: () => void
  reset: () => void
}

export const useZodiacStore = create<ZodiacState>((set) => ({
  step: 1,
  birthDetails: { name: '', dob: '', birthTime: '', birthPlace: '' },
  readingType: null,
  messages: [],
  isLoading: false,
  freeQuestionsLeft: 3,

  setBirthDetails: (details) => set({ birthDetails: details }),
  setReadingType: (type) => set({ readingType: type }),
  setStep: (step) => set({ step }),
  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  setLoading: (v) => set({ isLoading: v }),
  decrementFreeQuestions: () => set(s => ({ freeQuestionsLeft: Math.max(0, s.freeQuestionsLeft - 1) })),
  reset: () => set({
    step: 1,
    birthDetails: { name: '', dob: '', birthTime: '', birthPlace: '' },
    readingType: null,
    messages: [],
    isLoading: false,
    freeQuestionsLeft: 3,
  }),
}))
