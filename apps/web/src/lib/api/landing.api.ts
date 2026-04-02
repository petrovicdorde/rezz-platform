import { api } from '@/lib/api';
import type { PublicVenue } from '@/lib/types/landing.types';

export interface SearchFilters {
  type?: string;
  city?: string;
  date?: string;
  time?: string;
}

export const landingApi = {
  getFeaturedVenues: async (): Promise<PublicVenue[]> => {
    const response = await api.get<PublicVenue[]>('/venues/public');
    return response.data;
  },

  searchVenues: async (filters: SearchFilters): Promise<PublicVenue[]> => {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.city) params.set('city', filters.city);
    if (filters.date) params.set('date', filters.date);
    if (filters.time) params.set('time', filters.time);
    const response = await api.get<PublicVenue[]>(
      `/venues/public?${params.toString()}`,
    );
    return response.data;
  },
};
