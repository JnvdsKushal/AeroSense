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
 *
 * FIX: Separated 'loading' into two distinct states:
 *  - 'bootstrapping': only used during the initial session-restore on app
 *    startup. RootNavigator holds the full screen spinner for this state.
 *  - 'loading': used when the user is actively submitting the login form.
 *    RootNavigator keeps the NavigationContainer (and AuthNavigator) mounted
 *    during login, so the LoginScreen never unmounts mid-flight.
 *
 * FIX: Added a `_loginSeq` counter so a stale `bootstrap()` completion
 * (e.g. from React 19 strict-mode double-invoke or a previous session's
 * in-flight getMe()) cannot override a successful `login()` outcome.
 */

interface AuthState {
  user: User | null;
  /**
   * 'idle'          — initial, before bootstrap runs
   * 'bootstrapping' — bootstrap is in flight (show full-screen spinner)
   * 'loading'       — login form submitted, awaiting API response
   * 'authenticated' — valid session, app shell shown
   * 'unauthenticated' — no session, auth stack shown
   */
  status: 'idle' | 'bootstrapping' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  /** Restores a session from a previously stored token, if any. Call once
   * at app startup before rendering the navigator. */
  bootstrap: () => Promise<void>;
  login: (params: { company_name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

// Tracks the "generation" of the most recent login() call. Any in-flight
// bootstrap() that resolves after a login() has started will see that its
// own generation has been superseded and will not overwrite the store.
let _loginSeq = 0;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  bootstrap: async () => {
    // Capture the login generation at the time bootstrap starts. If login()
    // is called while bootstrap is in flight, the sequence will advance and
    // bootstrap's completion must not overwrite the login result.
    const seqAtStart = _loginSeq;

    set({ status: 'bootstrapping' });
    console.log('[AUTH] BOOTSTRAP: starting session restore');

    const token = await secureStorage.getToken();
    if (!token) {
      console.log('[AUTH] BOOTSTRAP: no stored token → unauthenticated');
      if (_loginSeq === seqAtStart) {
        set({ status: 'unauthenticated', user: null });
      }
      return;
    }

    console.log('[AUTH] BOOTSTRAP: token found, validating via GET /api/auth/me');
    try {
      const user = await authApi.getMe();
      // Only commit the result if login() hasn't been called since we started.
      if (_loginSeq === seqAtStart) {
        console.log('[AUTH] BOOTSTRAP: session restored for', user.email, 'role', user.role);
        set({ status: 'authenticated', user, error: null });
      } else {
        console.log('[AUTH] BOOTSTRAP: stale — login() already ran, discarding bootstrap result');
      }
    } catch {
      if (_loginSeq === seqAtStart) {
        console.log('[AUTH] BOOTSTRAP: getMe failed → clearing stale token, unauthenticated');
        await secureStorage.clearToken();
        set({ status: 'unauthenticated', user: null });
      }
    }
  },

  login: async ({ company_name, email, password }) => {
    // Advance the sequence counter so any concurrent bootstrap() knows its
    // result should be discarded.
    _loginSeq += 1;
    const mySeq = _loginSeq;

    set({ status: 'loading', error: null });
    console.log('[AUTH] LOGIN REQUEST: email =', email, ', company =', company_name);

    try {
      const res = await authApi.login({ company_name, email, password });

      console.log('[AUTH] LOGIN RESPONSE STATUS: 200 OK');
      console.log('[AUTH] LOGIN RESPONSE BODY: success =', res.success, ', user.role =', res.user?.role);
      console.log('[AUTH] TOKEN RECEIVED:', typeof res.token === 'string' && res.token.length > 0);

      await secureStorage.setToken(res.token);
      console.log('[AUTH] TOKEN PERSISTED to SecureStore');

      // Only apply the result if this is still the most recent login attempt.
      if (_loginSeq === mySeq) {
        set({ status: 'authenticated', user: res.user, error: null });
        console.log('[AUTH] AUTH STORE UPDATED: status = authenticated, user.role =', res.user.role);
      }
    } catch (err) {
      console.log('[AUTH] LOGIN FAILED:', err);
      if (_loginSeq === mySeq) {
        set({ status: 'unauthenticated', user: null });
      }
      throw err;
    }
  },

  logout: async () => {
    _loginSeq += 1; // invalidate any in-flight bootstrap/login
    await secureStorage.clearToken();
    set({ status: 'unauthenticated', user: null, error: null });
    console.log('[AUTH] LOGOUT: session cleared');
  },
}));

// Wire the API client's 401 handler to this store exactly once, at module
// load time — any request that comes back 401 (except /auth/me during
// bootstrap, and /auth/login which is a credential error, not a session
// expiry) drops the session, and the root navigator reacts to
// `status === 'unauthenticated'` by showing the login screen.
onUnauthorized(() => {
  console.log('[AUTH] 401 INTERCEPTOR: unauthorized → clearing session');
  useAuthStore.setState({ status: 'unauthenticated', user: null });
});
