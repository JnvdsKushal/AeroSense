/**
 * Roles and permissions.
 *
 * This file is a client-side UX mirror of authorization rules that are
 * ACTUALLY ENFORCED server-side in the Rust backend
 * (`backend/src/middleware/auth.rs`, `backend/src/routes/*.rs`). It exists
 * so the mobile app can hide/disable actions a user can't perform and give
 * immediate feedback — it is NOT a security boundary. Every request still
 * goes through the backend's own `require_role` / `require_company_scope`
 * checks, and the backend is the final word if this file and the API ever
 * disagree.
 *
 * Two rules were verified directly in the backend source and must be
 * mirrored exactly:
 *
 * 1. `require_role(user, &[...])` in the backend passes if the user's role
 *    is in the given allow-list, OR the user is COMPANY_ADMIN — regardless
 *    of whether COMPANY_ADMIN is in that allow-list. A company admin can
 *    do anything within their own company. See `canPerform` below, which
 *    replicates this exactly (`hasCompanyAdminOverride`).
 *
 * 2. SUPER_ADMIN is NOT given a blanket pass by `require_role` — it has no
 *    `company_id`, so `require_company_scope` rejects it from every
 *    company-operational route regardless of role checks. The Super Admin
 *    can only use the platform/company-management endpoints gated by
 *    `require_super_admin`.
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'COMPANY_ADMIN'
  | 'MANUFACTURER'
  | 'MAINTENANCE_TECHNICIAN'
  | 'INSPECTOR'
  | 'VIEWER';

export const ROLES: Record<UserRole, UserRole> = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  MANUFACTURER: 'MANUFACTURER',
  MAINTENANCE_TECHNICIAN: 'MAINTENANCE_TECHNICIAN',
  INSPECTOR: 'INSPECTOR',
  VIEWER: 'VIEWER',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  COMPANY_ADMIN: 'Company Admin',
  MANUFACTURER: 'Manufacturer',
  MAINTENANCE_TECHNICIAN: 'Maintenance Technician',
  INSPECTOR: 'Inspector',
  VIEWER: 'Viewer',
};

/**
 * Named permissions, each mapped to the backend endpoint(s) it gates.
 * `allow` lists exactly the roles the backend's `require_role` call lists
 * explicitly — do NOT add COMPANY_ADMIN to these lists; the override is
 * applied uniformly by `canPerform` instead, matching the backend's own
 * single implementation of that rule.
 */
export const PERMISSIONS = {
  /** POST /api/aircraft */
  CREATE_AIRCRAFT: { allow: ['MANUFACTURER'] as UserRole[] },
  /** POST /api/components */
  CREATE_COMPONENT: { allow: ['MANUFACTURER'] as UserRole[] },
  /** POST /api/tags/register */
  REGISTER_TAG: { allow: ['MANUFACTURER'] as UserRole[] },
  /** POST /api/maintenance */
  CREATE_MAINTENANCE: { allow: ['MAINTENANCE_TECHNICIAN'] as UserRole[] },
  /** POST /api/users, GET /api/users */
  MANAGE_USERS: { allow: ['COMPANY_ADMIN'] as UserRole[] },
  /** GET /api/analytics/overview */
  VIEW_COMPANY_ANALYTICS: { allow: ['COMPANY_ADMIN'] as UserRole[] },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Mirrors backend `require_role`: true if `role` is in the permission's
 * allow-list, OR `role` is COMPANY_ADMIN. SUPER_ADMIN is deliberately never
 * included by this override — it has no company to act within.
 */
export function canPerform(role: UserRole | null | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  if (role === 'COMPANY_ADMIN') return true;
  return PERMISSIONS[permission].allow.includes(role);
}

/**
 * True for every role that belongs to a company (i.e. everyone except the
 * Super Admin, whose `company_id` is always null — verified in
 * `backend/src/middleware/auth.rs::require_company_scope`). The Super Admin
 * cannot reach any company-operational endpoint (aircraft, components,
 * tags, maintenance, verification, blockchain, company users/analytics),
 * only the platform-level company-management endpoints.
 */
export function belongsToCompany(role: UserRole | null | undefined): boolean {
  return !!role && role !== 'SUPER_ADMIN';
}

/**
 * Verification and blockchain-integrity endpoints
 * (POST /api/verification/nfc, GET /api/verification/logs,
 * GET /api/components/:id/verification, POST /api/blockchain/verify) have
 * NO role restriction in the backend beyond company scope — confirmed in
 * `backend/src/routes/verification.rs`. Every company role, including
 * VIEWER, can scan and view verification results. This helper exists so
 * that fact is named and referenced explicitly rather than re-derived (or
 * silently assumed otherwise) at each call site.
 */
export function canVerify(role: UserRole | null | undefined): boolean {
  return belongsToCompany(role);
}

/** INSPECTOR and VIEWER have no write endpoints anywhere in the backend —
 * confirmed by absence from every `require_role` allow-list. Used to drive
 * read-only UI treatment (no create/edit affordances rendered at all,
 * rather than rendering them disabled). */
export function isReadOnlyRole(role: UserRole | null | undefined): boolean {
  return role === 'INSPECTOR' || role === 'VIEWER';
}
