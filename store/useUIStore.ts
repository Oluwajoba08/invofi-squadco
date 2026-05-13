// store/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  isRiskModalOpen: boolean;
  setRiskModal: (open: boolean) => void;
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isRiskModalOpen: false,
  setRiskModal: (open) => set({ isRiskModalOpen: open }),
  toast: null,
  showToast: (message, type) => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  }
}));