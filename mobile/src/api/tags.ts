import { apiClient } from './client';
import type { ComponentTag } from '../types/domain';
import type { RegisterTagRequest } from '../types/requests';

/**
 * NFC/RFID tag endpoints. Verified against backend/src/routes/tags.rs.
 *
 * POST /api/tags/register   → register tag to component (MANUFACTURER only,
 *                             or COMPANY_ADMIN override)
 * GET  /api/tags/:id        → get tag by DB ID (any company-scoped role)
 *
 * The component must belong to the caller's company — the backend validates
 * this. identifier must be globally unique across the platform.
 */
export const tagsApi = {
  register: async (payload: RegisterTagRequest): Promise<ComponentTag> => {
    const res = await apiClient.post<ComponentTag>('/tags/register', payload);
    return res.data;
  },

  getById: async (id: number): Promise<ComponentTag> => {
    const res = await apiClient.get<ComponentTag>(`/tags/${id}`);
    return res.data;
  },
};
