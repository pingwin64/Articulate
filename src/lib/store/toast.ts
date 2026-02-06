import { create } from 'zustand';
import type { FeatherIconName } from '../../types/icons';

interface ToastState {
  message: string | null;
  icon: FeatherIconName | null;
  showToast: (message: string, icon?: FeatherIconName) => void;
  clearToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  icon: null,
  showToast: (message, icon) => set({ message, icon: icon ?? null }),
  clearToast: () => set({ message: null, icon: null }),
}));
