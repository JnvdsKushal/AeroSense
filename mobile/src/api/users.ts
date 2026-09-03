import { apiClient } from './client';
import type { UserResponse } from '../types/domain';
import type { CreateUserRequest } from '../types/requests';

/**
 * Company Admin user management endpoints.
 * Verified against backend/src/routes/users.rs.
 *
 * POST /api/users  → create user in caller's company (Company Admin only)
 * GET  /api/users  → list users in caller's company (Company Admin only)
 *
 * The company_id is NEVER sent by the client — the backend derives it
 * exclusively from the authenticated JWT. This prevents any cross-tenant
 * user placement.
 */
export const usersApi = {
  create: async (payload: CreateUserRequest): Promise<UserResponse> => {
    const res = await apiClient.post<UserResponse>('/users', payload);
    return res.data;
  },

  list: async (): Promise<UserResponse[]> => {
    const res = await apiClient.get<UserResponse[]>('/users');
    return res.data;
  },
};
