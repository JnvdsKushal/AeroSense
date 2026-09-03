import type { NFCService } from './NFCService';
import type { NfcScanOutcome } from './types';

/**
 * Development-only NFC implementation. Simulates a scan with a short delay
 * and returns a scan of a fixed, clearly-fake identifier — it does not
 * touch any device hardware and works identically in Expo Go, a simulator,
 * or a physical device with NFC disabled.
 *
 * This exists so Modules 0–5 (and the early UI pass of Module 6) can be
 * built and tested end-to-end against the real backend's
 * `POST /api/verification/nfc` without requiring a Development Build or
 * physical NTAG 424 DNA hardware. The demo seed data
 * (`backend/src/db/mod.rs::seed_demo_data`, gated by `DEMO_SEED=true`)
 * registers real tags with identifiers `DEMO-NFC-0001`..`0004` for exactly
 * this purpose — point this mock at one of those to see a real AUTHENTIC
 * verdict end-to-end.
 *
 * `identifierOverride` lets a Module 6 dev-mode picker simulate scanning a
 * specific known tag (e.g. one of the DEMO-NFC-* identifiers) instead of
 * always returning the same fixed value — useful for testing every backend
 * verdict without hardware. Left undefined, it returns a single default.
 */
export class MockNFCService implements NFCService {
  private cancelled = false;

  async isSupported(): Promise<boolean> {
    return true;
  }

  async scan(identifierOverride?: string): Promise<NfcScanOutcome> {
    this.cancelled = false;

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (this.cancelled) {
      return { state: 'cancelled', message: 'Scan cancelled.' };
    }

    return {
      state: 'success',
      data: {
        identifier: identifierOverride ?? 'DEMO-NFC-0001',
        technology: 'NFC',
        security_type: 'MOCK',
      },
    };
  }

  async cancelScan(): Promise<void> {
    this.cancelled = true;
  }
}
