import { api } from '@/lib/api';

export interface ContactFormPayload {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}

export const contactApi = {
  submit: async (
    data: ContactFormPayload,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/contact', data);
    return response.data;
  },
};
