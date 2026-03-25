import { api } from '@/lib/api';
import { LoginRequest, LoginResponse } from '@/lib/types/auth.types';
import { AuthUser } from '@/store/auth.store';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  me: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>('/auth/me');
    return response.data;
  },
};
