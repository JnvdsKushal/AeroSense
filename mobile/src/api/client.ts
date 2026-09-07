import axios from 'axios';
import { API_BASE_URL } from '../constants/env';
import { secureStorage } from '../services/storage/secureStorage';

/**
 * The single Axios instance every API module (`auth.ts`, `aircraft.ts`,
 * `components.ts`, `verification.ts`, ...) imports and uses. Screens must
 * never call axios/fetch directly (brief Section 13) — they go through a
 * feature API module, which goes through this client.
 *
 * Mirrors the web frontend's `services/api.ts` interceptor pattern
 * (attach JWT, redirect-equivalent on 401) but adapted for React Native:
 * - JWT comes from `expo-secure-store` via `secureStorage`, not
 *   `localStorage` (which doesn't exist in RN).
 * - There's no `window.location.assign('/login')` on mobile — instead this
 *   module exposes a subscriber so the navigation layer (wired up in
 *   `AuthContext`) can react to a 401 by clearing session state and
 *   letting the root navigator's auth check naturally show the login
 *   screen. This file has no knowledge of navigation or React state.
 *
 * FIX: The 401 interceptor previously fired `unauthorizedListener` for
 * ANY 401 except `/auth/me`. This incorrectly triggered a global session
 * reset on a failed login attempt (wrong password → 401 from /auth/login),
 * which raced against the `authStore.login()` catch block and could leave
 * the store in an inconsistent state. Now only POST /auth/login is also
 * exempted: a 401 from the login endpoint is a credential error handled
 * entirely by `authStore.login()`'s own catch block — it is NOT a
 * session-expiry event that should blow away the auth state globally.
 */

const REQUEST_TIMEOUT_MS = 15000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;

/** Registered once by the auth store/context at app startup. */
export function onUnauthorized(listener: UnauthorizedListener): void {
  unauthorizedListener = listener;
}

/**
 * Endpoints that handle their own 401 logic and must NOT trigger the global
 * session-reset. Adding an endpoint here means a 401 from it is treated as a
 * domain/validation error (caught by the caller) rather than a session expiry.
 */
function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  // /auth/me  — bootstrap checks an existing token; 401 means no valid session
  //             yet, handled by bootstrap's catch block.
  // /auth/login — credential failure; 401 is caught by authStore.login().
  // /auth/change-password — authenticated endpoint; 401 here means the session
  //             truly expired and IS a valid trigger for the global reset.
  return url.endsWith('/auth/me') || url.endsWith('/auth/login');
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url: string | undefined = error?.config?.url;

    console.log('[API] ERROR INTERCEPTOR: status =', status, ', url =', url);

    // Only trigger the global session reset for a 401 on a protected endpoint.
    // Login and getMe 401s are handled by their respective callers.
    if (status === 401 && !isAuthEndpoint(url)) {
      console.log('[API] SESSION EXPIRED: clearing token and resetting auth state');
      await secureStorage.clearToken();
      unauthorizedListener?.();
    }

    return Promise.reject(error);
  }
);
