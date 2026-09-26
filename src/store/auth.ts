import { create } from 'zustand';
import type { User, Subscription } from '@/types';
import { authApi } from '@/api/auth';
import { setTokens, clearTokens, getToken } from '@/api/request';

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setSubscription: (sub: Subscription) => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  subscription: null,
  isAuthenticated: !!getToken(),

  login: async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    setTokens(res.token, res.refreshToken);
    set({
      user: {
        id: res.userId,
        username: res.username,
        email: res.email,
      },
      isAuthenticated: true,
    });
  },

  logout: () => {
    try {
      authApi.logout();
    } catch {
      // ignore
    }
    clearTokens();
    set({ user: null, subscription: null, isAuthenticated: false });
  },

  setUser: (user: User) => set({ user }),
  setSubscription: (sub: Subscription) => set({ subscription: sub }),

  checkAuth: () => get().isAuthenticated,
}));
