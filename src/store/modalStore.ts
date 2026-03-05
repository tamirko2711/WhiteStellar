import { create } from 'zustand'

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify-email'

interface ModalState {
  authModalOpen: boolean
  authModalMode: AuthMode
  preSelectedUserType: 'client' | 'advisor' | null
  openAuthModal: (mode?: AuthMode, preSelectedUserType?: 'client' | 'advisor') => void
  closeAuthModal: () => void
}

export const useModalStore = create<ModalState>(set => ({
  authModalOpen: false,
  authModalMode: 'login',
  preSelectedUserType: null,
  openAuthModal: (mode = 'login', preSelectedUserType) => set({
    authModalOpen: true,
    authModalMode: mode,
    preSelectedUserType: preSelectedUserType ?? null,
  }),
  closeAuthModal: () => set({ authModalOpen: false, preSelectedUserType: null }),
}))
