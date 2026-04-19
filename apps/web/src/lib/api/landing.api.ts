import { api } from '@/lib/api';
import type {
  LandingConfig,
  UpdateLandingConfigRequest,
} from '@/lib/types/landing.types';
import type { PublicVenue } from '@/lib/types/venue.types';
import type { VenueEvent } from '@/lib/types/event.types';

export interface SearchFilters {
  type?: string;
  city?: string;
  date?: string;
  time?: string;
}

export const landingApi = {
  getLandingData: async (): Promise<{
    config: LandingConfig;
    featuredVenues: PublicVenue[];
    featuredEvents: VenueEvent[];
  }> => {
    const response = await api.get<{
      config: LandingConfig;
      featuredVenues: PublicVenue[];
      featuredEvents: VenueEvent[];
    }>('/landing');
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

  getAdminConfig: async (): Promise<LandingConfig> => {
    const response = await api.get<LandingConfig>('/landing/config');
    return response.data;
  },

  updateConfig: async (
    data: UpdateLandingConfigRequest,
  ): Promise<{ message: string; config: LandingConfig }> => {
    const response = await api.patch<{
      message: string;
      config: LandingConfig;
    }>('/landing/config', data);
    return response.data;
  },
};
