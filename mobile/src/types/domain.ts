/**
 * Domain types mirrored from the Rust backend's response DTOs
 * (`backend/src/models/*.rs`), verified field-by-field against the backend
 * source and cross-checked against the existing web frontend's
 * `frontend/src/types/index.ts` for consistency. Keep these two in sync by
 * hand — there is no shared codegen (see backend README section 8).
 */

import type { UserRole } from '../constants/roles';

export type { UserRole };

// ---- Auth / Users ---------------------------------------------------------

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: UserRole;
  /** Null only for the platform Super Admin. */
  company_id: number | null;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

/**
 * Backend's `UserResponse` (backend/src/models/user.rs) has identical fields
 * to `User` minus `password_hash` (which is `#[serde(skip_serializing)]`).
 * Used for API responses that return user data without auth context.
 */
export type UserResponse = User;

// ---- Companies (Super Admin platform management) -------------------------

export interface Company {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | string;
  created_at: string;
  updated_at: string;
}

export interface CompanySummary extends Company {
  user_count: number;
  aircraft_count: number;
  component_count: number;
  maintenance_count: number;
  verification_count: number;
}

export interface MaintenanceResultCount {
  inspection_result: string;
  count: number;
}

export interface UserWorkCount {
  user_id: number;
  user_name: string;
  maintenance_count: number;
}

export interface WorkAnalytics {
  company_id: number;
  total_users: number;
  total_aircraft: number;
  total_components: number;
  total_maintenance_records: number;
  total_verifications: number;
  verifications_passed: number;
  verifications_failed: number;
  maintenance_by_result: MaintenanceResultCount[];
  records_by_user: UserWorkCount[];
}

// ---- Aircraft --------------------------------------------------------------

export interface Aircraft {
  id: number;
  aircraft_uuid: string;
  registration_number: string;
  model: string;
  manufacturer: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AircraftWithComponents extends Aircraft {
  components: ComponentResponse[];
}

// ---- Components -------------------------------------------------------------

export interface ComponentResponse {
  id: number;
  component_uuid: string;
  aircraft_id: number | null;
  aircraft_registration: string | null;
  serial_number: string;
  component_type: string;
  manufacturer: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ---- NFC / Component Tags ---------------------------------------------------

export interface ComponentTag {
  id: number;
  component_id: number;
  technology: 'NFC' | 'UHF_RFID' | string;
  identifier: string;
  security_type: string;
  tamper_status: 'INTACT' | 'TAMPERED' | 'UNKNOWN' | string;
  registered_at: string;
  updated_at: string;
}

// ---- Maintenance -------------------------------------------------------------

export interface MaintenanceRecordResponse {
  id: number;
  component_id: number;
  technician_id: number;
  technician_name: string;
  maintenance_type: string;
  description: string;
  parts_replaced: string | null;
  inspection_result: 'PASSED' | 'FAILED' | 'WARNING' | string;
  record_hash: string;
  created_at: string;
}

// ---- Verification ------------------------------------------------------------

export interface VerificationChecks {
  nfc_authentication: boolean;
  component_binding: boolean;
  tamper_status: boolean;
  blockchain_integrity: boolean;
}

export interface VerificationComponentInfo {
  id: string;
  aircraft: string;
  serial_number: string;
}

export type VerificationStatus = 'AUTHENTIC' | 'SUSPICIOUS' | 'INVALID';

export interface VerificationResponse {
  verified: boolean;
  status: VerificationStatus;
  component?: VerificationComponentInfo | null;
  checks: VerificationChecks;
  failure_reason?: string | null;
}

export interface VerificationLog {
  id: number;
  component_id: number | null;
  tag_id: number | null;
  authentication_result: boolean;
  component_binding_result: boolean;
  tamper_result: boolean;
  blockchain_result: boolean;
  final_result: VerificationStatus | string;
  failure_reason: string | null;
  created_at: string;
}

// ---- Blockchain ----------------------------------------------------------------

export interface BlockchainVerifyResponse {
  verified: boolean;
  record_id: number;
  db_hash: string;
  blockchain_hash: string;
  match_status: 'VALID' | 'MISMATCH' | string;
}

// ---- Backend error envelope -------------------------------------------------

/** Every error response from the backend uses this exact shape
 * (`backend/src/errors.rs::ErrorResponse`). */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
