import { api } from '@/lib/api';
import type {
  Setting,
  PublicSetting,
  SettingType,
  CreateSettingRequest,
  UpdateSettingRequest,
} from '@/lib/types/settings.types';

export const settingsApi = {
  getPublic: async (type: SettingType): Promise<PublicSetting[]> => {
    const response = await api.get<PublicSetting[]>(
      `/settings/public?type=${type}`,
    );
    return response.data;
  },

  getAll: async (type?: SettingType): Promise<Setting[]> => {
    const params = type ? `?type=${type}` : '';
    const response = await api.get<Setting[]>(`/settings${params}`);
    return response.data;
  },

  create: async (data: CreateSettingRequest): Promise<Setting> => {
    const response = await api.post<Setting>('/settings', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateSettingRequest,
  ): Promise<Setting> => {
    const response = await api.patch<Setting>(`/settings/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/settings/${id}`,
    );
    return response.data;
  },
};
