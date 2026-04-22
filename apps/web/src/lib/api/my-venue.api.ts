import { api } from '@/lib/api';
import type { AdminVenue, WorkingHours } from '@/lib/types/venue.types';
import type { PaymentMethod } from '@rezz/shared';

export interface UpdateMyVenueRequest {
  address?: string;
  description?: string;
  workingHours?: WorkingHours;
  paymentMethods?: PaymentMethod[];
  tags?: string[];
  tables?: { type: string; count: number; note?: string }[];
  socialLinks?: string[];
}

export const myVenueApi = {
  get: async (): Promise<AdminVenue> => {
    const response = await api.get<AdminVenue>('/my-venue');
    return response.data;
  },

  update: async (data: UpdateMyVenueRequest): Promise<AdminVenue> => {
    const response = await api.patch<AdminVenue>('/my-venue', data);
    return response.data;
  },
};
