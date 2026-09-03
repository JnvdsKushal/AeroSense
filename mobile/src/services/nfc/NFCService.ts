import type { NfcScanOutcome } from './types';

/**
 * The interface every part of the app (screens, hooks) depends on for NFC
 * — never `react-native-nfc-manager` directly, and never a screen doing
 * its own hardware calls (brief Section 21). This makes it possible to:
 *
 *   1. Develop and test the entire verification UI/flow (Module 6) against
 *      `MockNFCService`, with zero hardware and in Expo Go.
 *   2. Swap in `RealNFCService` (built in Module 6, backed by
 *      `react-native-nfc-manager` against NTAG 424 DNA + TagTamper
 *      hardware) later without touching a single screen or hook — only
 *      `getNFCService()` below changes.
 *
 * `isSupported()` exists because NFC availability is a real device/platform
 * question (no NFC radio, radio disabled, iOS vs. Android capability
 * differences) that the UI must be able to branch on before ever attempting
 * a scan.
 */
export interface NFCService {
  /** Whether this device can attempt an NFC scan at all right now. The
   * mock implementation always resolves `true` — the real implementation
   * (Module 6) will check actual hardware/radio state. */
  isSupported(): Promise<boolean>;

  /**
   * Initiates a single scan attempt and resolves once it completes, fails,
   * or is cancelled. Never rejects — every outcome (including hardware and
   * user-cancellation cases) is represented in `NfcScanOutcome` so callers
   * always have a defined state to render rather than needing a try/catch
   * for control flow.
   */
  scan(): Promise<NfcScanOutcome>;

  /** Cancels an in-flight scan, if any. Safe to call when nothing is
   * scanning. */
  cancelScan(): Promise<void>;
}
