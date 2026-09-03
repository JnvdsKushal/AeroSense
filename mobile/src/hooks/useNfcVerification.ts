import { useCallback, useRef, useState } from 'react';
import type { NfcScanState } from '../services/nfc/types';
import { getNFCService } from '../services/nfc';
import { verificationApi } from '../api/verification';
import type { VerificationResponse } from '../types/domain';

/**
 * State machine for an NFC verification flow.
 *
 * States in order:
 *   idle → scanning → verifying → result (success/failure/cancelled/error)
 *
 * The mock NFC service always returns DEMO-NFC-0001 unless overrideIdentifier
 * is provided (for testing different verdicts against backend seed data).
 *
 * The backend's `POST /api/verification/nfc` verdict is the authoritative
 * result — this hook NEVER produces a client-side "AUTHENTIC" claim of its own.
 */
export interface VerificationState {
  scanState: NfcScanState | 'idle' | 'verifying';
  result: VerificationResponse | null;
  error: string | null;
  tagIdentifier: string | null;
}

export function useNfcVerification() {
  const nfc = getNFCService();
  const [state, setState] = useState<VerificationState>({
    scanState: 'idle',
    result: null,
    error: null,
    tagIdentifier: null,
  });
  const cancelledRef = useRef(false);

  const startVerification = useCallback(
    async (identifierOverride?: string) => {
      cancelledRef.current = false;
      setState({ scanState: 'scanning', result: null, error: null, tagIdentifier: null });

      // Step 1: NFC scan
      const nfcService = nfc as any; // MockNFCService accepts override
      const outcome = await (typeof nfcService.scan === 'function'
        ? nfcService.scan(identifierOverride)
        : nfc.scan());

      if (cancelledRef.current) return;

      if (outcome.state !== 'success') {
        setState((prev) => ({
          ...prev,
          scanState: outcome.state as NfcScanState,
          error: (outcome as any).message ?? 'Scan failed',
        }));
        return;
      }

      const { identifier } = outcome.data;
      setState((prev) => ({
        ...prev,
        scanState: 'verifying',
        tagIdentifier: identifier,
      }));

      // Step 2: Send to backend
      try {
        const result = await verificationApi.verifyNfc({
          tag_identifier: identifier,
          payload: outcome.data.raw_payload,
        });

        if (cancelledRef.current) return;

        setState((prev) => ({
          ...prev,
          scanState: 'success',
          result,
        }));
      } catch (err: any) {
        if (cancelledRef.current) return;
        const message =
          err?.response?.data?.error ?? err?.message ?? 'Verification failed';
        setState((prev) => ({
          ...prev,
          scanState: 'error',
          error: message,
        }));
      }
    },
    [],
  );

  const cancel = useCallback(async () => {
    cancelledRef.current = true;
    await nfc.cancelScan();
    setState((prev) => ({
      ...prev,
      scanState: 'cancelled',
      error: 'Scan cancelled.',
    }));
  }, []);

  const reset = useCallback(() => {
    setState({ scanState: 'idle', result: null, error: null, tagIdentifier: null });
  }, []);

  return { ...state, startVerification, cancel, reset };
}
