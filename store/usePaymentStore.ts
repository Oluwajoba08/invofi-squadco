import { create } from 'zustand';

interface Actor {
  name: string;
  score: number;
  isVerified: boolean;
}

interface PaymentSession {
  id: string;
  amount: number;
  recipient: Actor | null;
  status: 'IDLE' | 'VERIFYING' | 'READY' | 'COMPLETED';
}

interface PaymentStore {
  currentSession: PaymentSession | null;
  setSession: (session: PaymentSession) => void;
  updateRecipientScore: (score: number) => void;
  resetSession: () => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  currentSession: null,
  setSession: (session) => set({ currentSession: session }),
  
  updateRecipientScore: (score) => set((state) => {
    if (!state.currentSession || !state.currentSession.recipient) return state;
    return {
      currentSession: {
        ...state.currentSession,
        recipient: { ...state.currentSession.recipient, score, isVerified: true }
      }
    };
  }),

  resetSession: () => set({ currentSession: null }),
}));