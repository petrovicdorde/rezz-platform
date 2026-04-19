import { api } from '@/lib/api';
import type { Reservation } from '@/lib/types/reservation.types';

export interface ProfileUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface MyReservationsResponse {
  upcoming: Reservation[];
  history: Reservation[];
}

export const profileApi = {
  getProfile: async (): Promise<ProfileUser> => {
    const response = await api.get<ProfileUser>('/profile');
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<ProfileUser> => {
    const response = await api.patch<ProfileUser>('/profile', data);
    return response.data;
  },

  getMyReservations: async (): Promise<MyReservationsResponse> => {
    const response = await api.get<MyReservationsResponse>(
      '/profile/reservations',
    );
    return response.data;
  },

  cancelReservation: async (
    id: string,
    reason: string,
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      `/profile/reservations/${id}/cancel`,
      { reason },
    );
    return response.data;
  },
};
