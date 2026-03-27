import { api } from '@/lib/api';
import type { AdminVenue, CreateVenueRequest } from '@/lib/types/venue.types';

export interface SendInvitationRequest {
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  role: 'MANAGER' | 'WORKER';
}

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

  sendInvitation: async (
    venueId: string,
    data: SendInvitationRequest,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/venues/${venueId}/invitations`,
      data,
    );
    return response.data;
  },
};
