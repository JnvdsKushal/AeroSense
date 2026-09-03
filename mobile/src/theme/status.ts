import { colors } from './tokens';

/** Semantic tone names used by Badge / StatusIndicator. Mirrors the web
 * app's `BadgeTone` union (`frontend/src/components/ui/Badge.tsx`) so the
 * same concept always maps to the same tone name across both apps. */
export type StatusTone = 'verified' | 'warning' | 'critical' | 'info' | 'neutral';

export const TONE_COLORS: Record<StatusTone, { fg: string; bg: string }> = {
  verified: { fg: colors.verified, bg: colors.verifiedMuted },
  warning: { fg: colors.warning, bg: colors.warningMuted },
  critical: { fg: colors.critical, bg: colors.criticalMuted },
  info: { fg: colors.info, bg: colors.infoMuted },
  neutral: { fg: colors.neutral, bg: colors.neutralMuted },
};

/**
 * Maps the backend's actual verification/status vocabulary to a tone.
 * Values verified against `backend/src/models/verification.rs` and
 * `maintenance.rs`: verification status is "AUTHENTIC" | "SUSPICIOUS" |
 * "INVALID"; tamper_status is "INTACT" | anything else; inspection_result
 * is free-text but the seed/demo data and frontend agree on "PASSED" |
 * "FAILED" | "WARNING"; company status is "ACTIVE" | "SUSPENDED".
 */
export function toneForStatus(value: string | null | undefined): StatusTone {
  switch ((value ?? '').toUpperCase()) {
    case 'AUTHENTIC':
    case 'VERIFIED':
    case 'INTACT':
    case 'PASSED':
    case 'PASS':
    case 'ACTIVE':
    case 'VALID':
    case 'OPERATIONAL':
      return 'verified';
    case 'SUSPICIOUS':
    case 'WARNING':
    case 'SUSPENDED':
      return 'warning';
    case 'INVALID':
    case 'TAMPERED':
    case 'FAILED':
    case 'FAIL':
    case 'MISMATCH':
      return 'critical';
    default:
      return 'neutral';
  }
}
