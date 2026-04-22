import { api } from '@/lib/api';
import type {
  AdminVenue,
  CreateVenueRequest,
  PublicVenue,
} from '@/lib/types/venue.types';

export const venuesApi = {
  getAll: async (): Promise<AdminVenue[]> => {
    const response = await api.get<AdminVenue[]>('/venues');
    return response.data;
  },

  getOne: async (id: string): Promise<AdminVenue> => {
    const response = await api.get<AdminVenue>(`/venues/${id}`);
    return response.data;
  },

  create: async (data: CreateVenueRequest): Promise<AdminVenue> => {
    const response = await api.post<AdminVenue>('/venues', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateVenueRequest>,
  ): Promise<AdminVenue> => {
    const response = await api.patch<AdminVenue>(`/venues/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/venues/${id}`);
  },

  setActive: async (
    id: string,
    isActive: boolean,
  ): Promise<AdminVenue> => {
    const response = await api.patch<AdminVenue>(`/venues/${id}/status`, {
      isActive,
    });
    return response.data;
  },

  searchPublic: async (filters?: {
    type?: string;
    city?: string;
  }): Promise<PublicVenue[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.city) params.set('city', filters.city);
    const response = await api.get<PublicVenue[]>(
      `/venues/public?${params.toString()}`,
    );
    return response.data;
  },

  getPublicOne: async (id: string): Promise<PublicVenue> => {
    const response = await api.get<PublicVenue>(`/venues/public/${id}`);
    return response.data;
  },
};
