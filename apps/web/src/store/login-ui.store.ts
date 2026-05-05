import { create } from 'zustand';

type LoginView = 'login' | 'forgot';

interface LoginUIState {
  isOpen: boolean;
  view: LoginView;
  open: () => void;
  close: () => void;
  showLogin: () => void;
  showForgot: () => void;
}

export const useLoginStore = create<LoginUIState>((set) => ({
  isOpen: false,
  view: 'login',
  open: () => set({ isOpen: true, view: 'login' }),
  close: () => set({ isOpen: false }),
  showLogin: () => set({ view: 'login' }),
  showForgot: () => set({ view: 'forgot' }),
}));
