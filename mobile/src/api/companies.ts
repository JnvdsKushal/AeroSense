import { apiClient } from './client';
import type {
  Company,
  CompanySummary,
  UserResponse,
  WorkAnalytics,
} from '../types/domain';
import type {
  CreateCompanyRequest,
  CreateCompanyAdminRequest,
  UpdateCompanyStatusRequest,
} from '../types/requests';

/**
 * All company/tenant management endpoints.
 * These are Super Admin only — verified against backend/src/routes/companies.rs.
 *
 * POST   /api/companies                → create company
 * GET    /api/companies                → list all companies + stats
 * GET    /api/companies/:id            → single company + stats
 * GET    /api/companies/:id/analytics  → detailed work analytics for company
 * POST   /api/companies/:id/admins     → provision first Company Admin
 * GET    /api/companies/:id/users      → list company's users
 * PUT    /api/companies/:id/status     → activate / suspend company
 */
export const companiesApi = {
  create: async (payload: CreateCompanyRequest): Promise<Company> => {
    const res = await apiClient.post<Company>('/companies', payload);
    return res.data;
  },

  list: async (): Promise<CompanySummary[]> => {
    const res = await apiClient.get<CompanySummary[]>('/companies');
    return res.data;
  },

  getById: async (id: number): Promise<CompanySummary> => {
    const res = await apiClient.get<CompanySummary>(`/companies/${id}`);
    return res.data;
  },

  getAnalytics: async (id: number): Promise<WorkAnalytics> => {
    const res = await apiClient.get<WorkAnalytics>(`/companies/${id}/analytics`);
    return res.data;
  },

  createAdmin: async (
    companyId: number,
    payload: CreateCompanyAdminRequest,
  ): Promise<UserResponse> => {
    const res = await apiClient.post<UserResponse>(
      `/companies/${companyId}/admins`,
      payload,
    );
    return res.data;
  },

  listUsers: async (companyId: number): Promise<UserResponse[]> => {
    const res = await apiClient.get<UserResponse[]>(
      `/companies/${companyId}/users`,
    );
    return res.data;
  },

  updateStatus: async (
    companyId: number,
    payload: UpdateCompanyStatusRequest,
  ): Promise<Company> => {
    const res = await apiClient.put<Company>(
      `/companies/${companyId}/status`,
      payload,
    );
    return res.data;
  },
};
