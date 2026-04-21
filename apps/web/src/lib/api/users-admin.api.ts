import { api } from '@/lib/api';
import type { AdminUser } from '@/lib/types/user-admin.types';
import type { UserRole } from '@rezz/shared';

export interface UsersAdminFilters {
  role?: UserRole;
  isActive?: boolean;
  isBlacklisted?: boolean;
  search?: string;
}

export const usersAdminApi = {
  getAll: async (filters?: UsersAdminFilters): Promise<AdminUser[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.isActive !== undefined)
      params.set('isActive', String(filters.isActive));
    if (filters?.isBlacklisted !== undefined)
      params.set('isBlacklisted', String(filters.isBlacklisted));
    if (filters?.search) params.set('search', filters.search);
    const response = await api.get<AdminUser[]>(
      `/admin/users?${params.toString()}`,
    );
    return response.data;
  },

  getOne: async (id: string): Promise<AdminUser> => {
    const response = await api.get<AdminUser>(`/admin/users/${id}`);
    return response.data;
  },

  setActive: async (
    id: string,
    isActive: boolean,
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      `/admin/users/${id}/active`,
      { isActive },
    );
    return response.data;
  },

  setBlacklisted: async (
    id: string,
    isBlacklisted: boolean,
    reason?: string,
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      `/admin/users/${id}/blacklist`,
      { isBlacklisted, reason },
    );
    return response.data;
  },

  remove: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/admin/users/${id}`,
    );
    return response.data;
  },
};
