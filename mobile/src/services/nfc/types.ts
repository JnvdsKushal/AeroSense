/**
 * NFC service abstraction — types.
 *
 * These states and shapes are designed against what the backend ACTUALLY
 * does today (`backend/src/services/nfc_service.rs`,
 * `verification_service.rs`), not an imagined future protocol:
 *
 * - The backend's current `MockNfcService` only checks two things: is the
 *   identifier non-empty, and is `raw_payload` the literal string
 *   `"INVALID_NFC_SIGNATURE"`. `NfcTagScanData.dynamic_counter` and
 *   `.cmac_signature` exist in the backend struct but are read by nothing
 *   yet — they're placeholders for real NTAG 424 DNA support, not live
 *   fields. This client-side type includes them for forward compatibility
 *   with Module 6, but nothing should assume the backend validates them
 *   today.
 * - `NFC_MODE` in the backend's `.env` is parsed into `Config` but never
 *   read anywhere else in the codebase — there is currently no server-side
 *   mode switch between mock and real verification. This is a real gap,
 *   not a mobile assumption; closing it is backend work for Module 6, to
 *   be proposed explicitly then, not silently worked around here.
 * - The physical NTAG 424 DNA + TagTamper hardware is not wired up
 *   anywhere yet. `RealNfcManager` is a Module 6 deliverable.
 *
 * The mobile app must not claim stronger security guarantees than what the
 * backend currently verifies (brief Section 24). Until Module 6, "NFC
 * verification" in this app can only ever mean: read a tag identifier,
 * send it to `POST /api/verification/nfc`, and show the backend's real
 * verdict — never a client-side "verified" claim of its own.
 */

/** Mirrors `backend::models::NfcTagScanData` exactly, so a captured scan
 * can be sent to `POST /api/verification/nfc` (via `tag_identifier` /
 * `payload`) without reshaping. */
export interface NfcScanData {
  /** Hardware UID, e.g. "04:A3:91:XX" */
  identifier: string;
  technology: 'NFC' | 'UHF_RFID';
  /** "MOCK" | "BASIC_UID" | "SECURE_NTAG424" */
  security_type: string;
  raw_payload?: string;
  /** Present only once Module 6 wires up real NTAG 424 DNA reads. Unused
   * by the backend today. */
  dynamic_counter?: number;
  /** Present only once Module 6 wires up real NTAG 424 DNA reads. Unused
   * by the backend today. */
  cmac_signature?: string;
}

/**
 * Every state the scan UI must be able to render (brief Section 23).
 * `unavailable` / `permission_required` are device/hardware states that
 * only apply once a real NFC manager exists (Module 6) — the mock manager
 * reports `ready` immediately since there's no hardware to check.
 */
export type NfcScanState =
  | 'unavailable'
  | 'permission_required'
  | 'ready'
  | 'scanning'
  | 'reading'
  | 'success'
  | 'error'
  | 'cancelled';

export interface NfcScanResult {
  state: 'success';
  data: NfcScanData;
}

export interface NfcScanFailure {
  state: 'error' | 'cancelled' | 'unavailable' | 'permission_required';
  message: string;
}

export type NfcScanOutcome = NfcScanResult | NfcScanFailure;
