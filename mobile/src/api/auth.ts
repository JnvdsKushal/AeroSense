import { apiClient } from './client';
import type { AuthResponse, User } from '../types/domain';
import type { ChangePasswordRequest, LoginRequest } from '../types/requests';

/**
 * POST /api/auth/login, GET /api/auth/me, PUT /api/auth/change-password —
 * verified against `backend/src/routes/auth.rs`. Note login requires
 * `company_name` in addition to email/password (see `LoginRequest`).
 */
export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<User> => {
    const res = await apiClient.put<User>('/auth/change-password', payload);
    return res.data;
  },
};
