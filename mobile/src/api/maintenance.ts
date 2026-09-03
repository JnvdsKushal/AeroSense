import { apiClient } from './client';
import type { MaintenanceRecordResponse } from '../types/domain';
import type { CreateMaintenanceRequest } from '../types/requests';

/**
 * Maintenance endpoints. Verified against backend/src/routes/maintenance.rs.
 *
 * POST /api/maintenance                   → create (MAINTENANCE_TECHNICIAN only,
 *                                           or COMPANY_ADMIN override)
 * GET  /api/maintenance                   → list all for company
 * GET  /api/components/:id/history        → component-specific history
 *
 * company_id derived from JWT — never sent by client.
 * Backend computes a SHA-256 record_hash at creation and stores it in
 * maintenance_records.record_hash AND blockchain_records.onchain_hash.
 */
export const maintenanceApi = {
  create: async (
    payload: CreateMaintenanceRequest,
  ): Promise<MaintenanceRecordResponse> => {
    const res = await apiClient.post<MaintenanceRecordResponse>(
      '/maintenance',
      payload,
    );
    return res.data;
  },

  list: async (): Promise<MaintenanceRecordResponse[]> => {
    const res = await apiClient.get<MaintenanceRecordResponse[]>('/maintenance');
    return res.data;
  },

  getComponentHistory: async (
    componentId: number,
  ): Promise<MaintenanceRecordResponse[]> => {
    const res = await apiClient.get<MaintenanceRecordResponse[]>(
      `/components/${componentId}/history`,
    );
    return res.data;
  },
};
