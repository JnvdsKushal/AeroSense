import axios from 'axios';
import type { ApiErrorResponse } from '../types/domain';

/**
 * Normalized shape every API-layer failure gets converted into, whether it
 * originated from the backend's structured error envelope
 * (`backend/src/errors.rs`), an HTTP-level failure with no body, or a
 * network/timeout failure that never reached the server at all.
 */
export interface NormalizedApiError {
  /** Machine-readable code. Backend codes (e.g. "VALIDATION_ERROR",
   * "NFC_TAG_NOT_REGISTERED") pass through as-is; connectivity failures get
   * one of the synthetic codes below. */
  code: string;
  /** Human-readable message, safe to show directly in the UI. */
  message: string;
  /** HTTP status code, when one was received. */
  status?: number;
}

export const SYNTHETIC_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;

/**
 * Converts anything thrown by an axios call into a `NormalizedApiError`.
 * Every API module (auth, aircraft, components, verification, ...) should
 * catch through this rather than inspecting `AxiosError` shapes ad hoc, so
 * every screen's error state renders consistently regardless of which
 * endpoint failed.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return {
        code: SYNTHETIC_ERROR_CODES.TIMEOUT,
        message: 'The request took too long to respond. Check your connection and try again.',
      };
    }

    if (!error.response) {
      return {
        code: SYNTHETIC_ERROR_CODES.NETWORK_ERROR,
        message: 'Could not reach the server. Check your network connection and API address.',
      };
    }

    const status = error.response.status;
    const body = error.response.data as ApiErrorResponse | undefined;

    if (body?.error?.message) {
      return { code: body.error.code, message: body.error.message, status };
    }

    return {
      code: SYNTHETIC_ERROR_CODES.UNKNOWN,
      message: `Request failed (${status}).`,
      status,
    };
  }

  if (error instanceof Error) {
    return { code: SYNTHETIC_ERROR_CODES.UNKNOWN, message: error.message };
  }

  return { code: SYNTHETIC_ERROR_CODES.UNKNOWN, message: 'An unexpected error occurred.' };
}
