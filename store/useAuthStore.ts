import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserType } from '@/services/types';

interface AuthState {
  token: string | null;
  userType: UserType | null;
  userId: string | null;
  displayName: string | null;
  vScore: number | null;
  isOnboarded: boolean;

  // Actions
  setToken: (token: string) => void;
  setUser: (payload: {
    userId: string;
    userType: UserType;
    displayName: string;
    vScore?: number;
  }) => void;
  setVScore: (score: number) => void;
  setOnboarded: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userType: null,
      userId: null,
      displayName: null,
      vScore: null,
      isOnboarded: false,

      setToken: (token) => set({ token }),

      setUser: ({ userId, userType, displayName, vScore }) =>
        set({ userId, userType, displayName, vScore: vScore ?? null }),

      setVScore: (score) => set({ vScore: score }),

      setOnboarded: () => set({ isOnboarded: true }),

      logout: () =>
        set({
          token: null,
          userType: null,
          userId: null,
          displayName: null,
          vScore: null,
          isOnboarded: false,
        }),
    }),
    {
      name: 'vproof-auth',
      partialize: (state) => ({
        token: state.token,
        userType: state.userType,
        userId: state.userId,
        displayName: state.displayName,
        vScore: state.vScore,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);