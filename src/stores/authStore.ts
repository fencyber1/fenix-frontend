import { create } from 'zustand';
import type { AuthUser } from '@/types/models';
import { authApi } from '@/api/endpoints';
import { setAccessToken } from '@/api/client';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  setSession: (token: string, user: AuthUser) => void;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  registerSchool: (payload: {
    schoolName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  setSession: (token, user) => {
    setAccessToken(token);
    set({ user, status: 'authenticated' });
  },

  /**
   * On app load there is no in-memory access token (refresh token cookie may
   * still be valid). The axios refresh interceptor handles silent re-auth, so
   * we simply try /auth/me and let a 401 fall through to unauthenticated.
   */
  bootstrap: async () => {
    set({ status: 'loading' });
    try {
      const user = await authApi.me();
      set({ user, status: 'authenticated' });
    } catch {
      setAccessToken(null);
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login: async (email, password) => {
    const { accessToken, user } = await authApi.login(email, password);
    setAccessToken(accessToken);
    set({ user, status: 'authenticated' });
    return user;
  },

  registerSchool: async (payload) => {
    const { accessToken, user } = await authApi.register(payload);
    setAccessToken(accessToken);
    set({ user, status: 'authenticated' });
    return user;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      set({ user: null, status: 'unauthenticated' });
    }
  },

  clear: () => {
    setAccessToken(null);
    set({ user: null, status: 'unauthenticated' });
  },
}));
