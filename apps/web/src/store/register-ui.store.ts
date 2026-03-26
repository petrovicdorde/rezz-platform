import { create } from 'zustand';

type RegisterView = 'form' | 'check-email';

interface RegisterUIState {
  isOpen: boolean;
  view: RegisterView;
  email: string;
  open: () => void;
  close: () => void;
  showCheckEmail: (email: string) => void;
  reset: () => void;
}

export const useRegisterStore = create<RegisterUIState>((set) => ({
  isOpen: false,
  view: 'form',
  email: '',
  open: () => set({ isOpen: true, view: 'form', email: '' }),
  close: () => set({ isOpen: false }),
  showCheckEmail: (email: string) => set({ view: 'check-email', email }),
  reset: () => set({ view: 'form', email: '' }),
}));
