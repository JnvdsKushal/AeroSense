import * as SecureStore from 'expo-secure-store';

/**
 * Thin wrapper around `expo-secure-store` (iOS Keychain / Android Keystore).
 *
 * This is the ONLY place the app touches secure storage. The web frontend
 * uses `localStorage` (see `frontend/src/services/api.ts`,
 * `frontend/src/context/AuthContext.tsx`), which is explicitly disallowed
 * for the mobile app (see brief Section 9) — `localStorage` doesn't exist
 * in React Native, and even if it did, it's unencrypted. Every other module
 * that needs to persist the JWT goes through this abstraction rather than
 * calling `expo-secure-store` directly, so the storage mechanism can change
 * in one place if ever needed.
 */

const AUTH_TOKEN_KEY = 'aerosense_auth_token';

export const secureStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch {
      // Corrupt keychain entry or platform-level failure — treat as "no
      // session" rather than crashing the app on startup.
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },

  async clearToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch {
      // Nothing to clean up — already absent.
    }
  },
};
