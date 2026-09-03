import { apiClient } from './client';
import type {
  VerificationResponse,
  VerificationLog,
  BlockchainVerifyResponse,
} from '../types/domain';
import type {
  NfcVerificationRequest,
  BlockchainVerifyRequest,
} from '../types/requests';

/**
 * Verification endpoints. Verified against backend/src/routes/verification.rs.
 *
 * POST /api/verification/nfc               → NFC tag verification (any company role)
 * GET  /api/verification/logs              → list verification logs for company
 * GET  /api/components/:id/verification    → component-specific verification logs
 * POST /api/blockchain/verify              → integrity check for a maintenance record
 *
 * Notes:
 * - simulate_scenario is only accepted when ALLOW_VERIFICATION_SIMULATION=true
 *   AND the caller is COMPANY_ADMIN. Never expose this as a normal UI option.
 * - The "blockchain" is a SQLite table (blockchain_records), not a real
 *   distributed ledger. The verify call compares maintenance_records.record_hash
 *   against blockchain_records.onchain_hash.
 */
export const verificationApi = {
  verifyNfc: async (
    payload: NfcVerificationRequest,
  ): Promise<VerificationResponse> => {
    const res = await apiClient.post<VerificationResponse>(
      '/verification/nfc',
      payload,
    );
    return res.data;
  },

  getLogs: async (): Promise<VerificationLog[]> => {
    const res = await apiClient.get<VerificationLog[]>('/verification/logs');
    return res.data;
  },

  getComponentVerifications: async (
    componentId: number,
  ): Promise<VerificationLog[]> => {
    const res = await apiClient.get<VerificationLog[]>(
      `/components/${componentId}/verification`,
    );
    return res.data;
  },

  verifyBlockchainRecord: async (
    payload: BlockchainVerifyRequest,
  ): Promise<BlockchainVerifyResponse> => {
    const res = await apiClient.post<BlockchainVerifyResponse>(
      '/blockchain/verify',
      payload,
    );
    return res.data;
  },
};
