import { apiClient } from './client';
import type { WorkAnalytics } from '../types/domain';

/**
 * GET /api/analytics/overview — Company Admin only.
 * Returns the caller's own company's work analytics (headcounts, fleet,
 * maintenance by result, verifications, per-user output).
 * Verified against backend/src/routes/analytics.rs and
 * backend/src/services/company_service.rs.
 */
export const analyticsApi = {
  getOverview: async (): Promise<WorkAnalytics> => {
    const res = await apiClient.get<WorkAnalytics>('/analytics/overview');
    return res.data;
  },
};
