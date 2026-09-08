import type { NFCService } from './NFCService';
import { RealNFCService } from './RealNFCService';

export type { NFCService } from './NFCService';
export type {
  NfcScanData,
  NfcScanOutcome,
  NfcScanState,
} from './types';

let instance: NFCService | null = null;

export function getNFCService(): NFCService {
  if (!instance) {
    instance = new RealNFCService();
  }

  return instance;
}