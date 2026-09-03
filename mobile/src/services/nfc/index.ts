import type { NFCService } from './NFCService';
import { MockNFCService } from './MockNFCService';

export type { NFCService } from './NFCService';
export type { NfcScanData, NfcScanOutcome, NfcScanState } from './types';

/**
 * Single factory function the rest of the app calls to get an NFC service
 * instance — never construct `MockNFCService` or (in Module 6)
 * `RealNFCService` directly at a call site.
 *
 * Module 0–5: always returns the mock. Module 6 will branch this on a
 * build-time or runtime flag (e.g. whether `react-native-nfc-manager`
 * reports real hardware support) to return `RealNFCService` instead — that
 * is the ONLY file that will need to change to make that switch.
 */
let instance: NFCService | null = null;

export function getNFCService(): NFCService {
  if (!instance) {
    instance = new MockNFCService();
  }
  return instance;
}
