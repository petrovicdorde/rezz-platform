import { create } from 'zustand';

interface LoginUIState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useLoginStore = create<LoginUIState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
