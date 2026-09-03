import { create } from 'zustand';
import type { User } from '../types/domain';
import { secureStorage } from '../services/storage/secureStorage';
import { onUnauthorized } from '../api/client';
import { authApi } from '../api/auth';

/**
 * Authentication/session state. This is the single source of truth for
 * "who is logged in" that navigation and role-gated UI read from.
 *
 * Module 0 scope: bootstrap (restore session on app start) and the 401 →
 * logout wiring, so the navigation architecture has something real to
 * branch on. The full login screen, form handling, and login-error UX are
 * Module 1's job (per the module plan) — `login()` here is a thin,
 * functional pass-through to `authApi.login`, not yet wired to any screen.
 */

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  /** Restores a session from a previously stored token, if any. Call once
   * at app startup before rendering the navigator. */
  bootstrap: () => Promise<void>;
  login: (params: { company_name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  bootstrap: async () => {
    set({ status: 'loading' });
    const token = await secureStorage.getToken();
    if (!token) {
      set({ status: 'unauthenticated', user: null });
      return;
    }
    try {
      const user = await authApi.getMe();
      set({ status: 'authenticated', user, error: null });
    } catch {
      await secureStorage.clearToken();
      set({ status: 'unauthenticated', user: null });
    }
  },

  login: async ({ company_name, email, password }) => {
    set({ status: 'loading', error: null });
    try {
      const res = await authApi.login({ company_name, email, password });
      await secureStorage.setToken(res.token);
      set({ status: 'authenticated', user: res.user, error: null });
    } catch (err) {
      set({ status: 'unauthenticated', user: null });
      throw err;
    }
  },

  logout: async () => {
    await secureStorage.clearToken();
    set({ status: 'unauthenticated', user: null, error: null });
  },
}));

// Wire the API client's 401 handler to this store exactly once, at module
// load time — any request that comes back 401 (except /auth/me during
// bootstrap) drops the session, and the root navigator reacts to
// `status === 'unauthenticated'` by showing the login screen.
onUnauthorized(() => {
  useAuthStore.setState({ status: 'unauthenticated', user: null });
});
