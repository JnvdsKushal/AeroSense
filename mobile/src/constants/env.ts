import Constants from 'expo-constants';

/**
 * Resolves the backend API base URL for the current run.
 *
 * The Rust/Axum backend (see `backend/.env.example`) serves everything
 * under `/api`, health at `/health`, and binds to `0.0.0.0:8080` by
 * default. On a physical device, `localhost` resolves to the phone
 * itself — not your dev machine — so the base URL must be configurable
 * per environment (Section 28 of the project brief) instead of hardcoded.
 *
 * Resolution order:
 *   1. `EXPO_PUBLIC_API_BASE_URL` — set this in `.env` (see `.env.example`)
 *      to your dev machine's LAN IP, e.g. `http://192.168.1.23:8080/api`,
 *      or to a staging/production URL. Expo inlines `EXPO_PUBLIC_*` vars
 *      into the JS bundle at build time.
 *   2. `app.json`'s `expo.extra.apiBaseUrlDefault` — a last-resort default
 *      for local simulator/emulator use only (works there because
 *      simulators share the host machine's localhost).
 *
 * Never hardcode a base URL inside a screen or API module — always go
 * through this file so switching environments never requires touching
 * call sites.
 */
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    return stripTrailingSlash(fromEnv.trim());
  }

  const fromAppConfig = Constants.expoConfig?.extra?.apiBaseUrlDefault as string | undefined;
  if (fromAppConfig && fromAppConfig.trim().length > 0) {
    return stripTrailingSlash(fromAppConfig.trim());
  }

  // Absolute last resort — only correct for a simulator/emulator running
  // on the same machine as the backend. Physical devices MUST set
  // EXPO_PUBLIC_API_BASE_URL in .env or every request will fail.
  return 'http://localhost:8080/api';
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const API_BASE_URL = resolveApiBaseUrl();

/** Derived from API_BASE_URL by stripping the trailing `/api`, since the
 * backend's health check lives at `/health`, not `/api/health`. */
export const HEALTH_URL = `${API_BASE_URL.replace(/\/api$/, '')}/health`;

export const IS_DEV = __DEV__;
