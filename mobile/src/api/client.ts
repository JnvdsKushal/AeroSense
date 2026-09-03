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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url: string | undefined = error?.config?.url;

    // GET /auth/me is exempt for the same reason as the web frontend: the
    // auth bootstrap flow already treats a 401 there as "no valid session
    // yet" rather than "session expired" — see AuthContext's init logic.
    if (status === 401 && !url?.endsWith('/auth/me')) {
      await secureStorage.clearToken();
      unauthorizedListener?.();
    }

    return Promise.reject(error);
  }
);
