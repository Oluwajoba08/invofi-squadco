import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveToken, removeToken } from '@/utils/auth';

interface User {
  id: string;
  name: string;
  role: 'INSTITUTION' | 'INDIVIDUAL' | 'VENDOR';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setToken: (token) => {
        saveToken(token);
        set({ token });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        removeToken();
        set({ user: null, token: null });
      },
    }),
    { name: 'vp-auth-storage' }
  )
);