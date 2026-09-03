import { apiClient } from './client';
import type { ComponentResponse } from '../types/domain';
import type { CreateComponentRequest } from '../types/requests';

/**
 * Component endpoints. Verified against backend/src/routes/components.rs.
 *
 * POST /api/components       → create (MANUFACTURER only, or COMPANY_ADMIN override)
 * GET  /api/components       → list (any company-scoped role)
 * GET  /api/components/:id   → detail (any company-scoped role)
 *
 * company_id derived from JWT — never sent by client.
 */
export const componentsApi = {
  create: async (payload: CreateComponentRequest): Promise<ComponentResponse> => {
    const res = await apiClient.post<ComponentResponse>('/components', payload);
    return res.data;
  },

  list: async (): Promise<ComponentResponse[]> => {
    const res = await apiClient.get<ComponentResponse[]>('/components');
    return res.data;
  },

  getById: async (id: number): Promise<ComponentResponse> => {
    const res = await apiClient.get<ComponentResponse>(`/components/${id}`);
    return res.data;
  },
};
