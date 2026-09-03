/**
 * Request body shapes, mirrored from the backend's `CreateXRequest` /
 * `XRequest` structs (`backend/src/models/*.rs`). Field names and
 * optionality match the backend exactly — these are sent as JSON verbatim.
 */

// ── Companies (Super Admin, backend/src/models/company.rs) ──────────────────

export interface CreateCompanyRequest {
  name: string;
  /** Optional — auto-generated from name when omitted. */
  slug?: string;
}

export interface CreateCompanyAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateCompanyStatusRequest {
  /** e.g. "ACTIVE" | "SUSPENDED" */
  status: string;
}

export interface LoginRequest {
  /** Must exactly match (case-insensitive) the account's real company
   * name, or literally "Super Admin" for the platform Super Admin. This is
   * a credential check on the backend, not a tenant selector — see
   * `backend/src/services/auth_service.rs::login`. */
  company_name: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface CreateAircraftRequest {
  registration_number: string;
  model: string;
  manufacturer: string;
  status?: string;
}

export interface CreateComponentRequest {
  aircraft_id?: number | null;
  serial_number: string;
  component_type: string;
  manufacturer: string;
  status?: string;
}

export interface RegisterTagRequest {
  component_id: number;
  /** e.g. "NFC", "UHF_RFID" */
  technology: string;
  /** Hardware UID, e.g. "04:A3:91:XX" */
  identifier: string;
  /** e.g. "MOCK", "BASIC_UID", "SECURE_NTAG424" — defaults to "MOCK"
   * server-side if omitted. */
  security_type?: string;
}

export interface CreateMaintenanceRequest {
  component_id: number;
  maintenance_type: string;
  description: string;
  parts_replaced?: string | null;
  /** e.g. "PASSED", "FAILED", "WARNING" */
  inspection_result: string;
}

export interface NfcVerificationRequest {
  tag_identifier: string;
  payload?: string;
  /**
   * Demo-only override ("UNKNOWN_TAG" | "INVALID_TAG" | "TAMPERED_TAG" |
   * "BLOCKCHAIN_MISMATCH"). The backend rejects this entirely unless the
   * deployment has `ALLOW_VERIFICATION_SIMULATION=true`, and even then only
   * accepts it from a COMPANY_ADMIN. Must never be exposed as a normal
   * scanning option in the UI — see `backend/src/routes/verification.rs`.
   */
  simulate_scenario?: string;
}

export interface BlockchainVerifyRequest {
  record_id: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}
