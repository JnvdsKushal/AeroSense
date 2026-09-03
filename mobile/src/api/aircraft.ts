import { apiClient } from './client';
import type { Aircraft, AircraftWithComponents } from '../types/domain';
import type { CreateAircraftRequest } from '../types/requests';

/**
 * Aircraft endpoints. Verified against backend/src/routes/aircraft.rs.
 *
 * POST /api/aircraft       → create (MANUFACTURER only, or COMPANY_ADMIN override)
 * GET  /api/aircraft       → list (any company-scoped role)
 * GET  /api/aircraft/:id   → detail with components (any company-scoped role)
 *
 * company_id is derived from JWT server-side — never sent by client.
 */
export const aircraftApi = {
  create: async (payload: CreateAircraftRequest): Promise<Aircraft> => {
    const res = await apiClient.post<Aircraft>('/aircraft', payload);
    return res.data;
  },

  list: async (): Promise<Aircraft[]> => {
    const res = await apiClient.get<Aircraft[]>('/aircraft');
    return res.data;
  },

  getById: async (id: number): Promise<AircraftWithComponents> => {
    const res = await apiClient.get<AircraftWithComponents>(`/aircraft/${id}`);
    return res.data;
  },
};
