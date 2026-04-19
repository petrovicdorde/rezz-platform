import { api } from '@/lib/api';
import type {
  Reservation,
  CreateReservationRequest,
  GuestRatingRequest,
  GuestRating,
  AvailableSlots,
} from '@/lib/types/reservation.types';
import type { ReservationStatus, ReservationSource, TableType } from '@rezz/shared';

export const reservationsApi = {
  getAll: async (
    venueId: string,
    filters?: {
      status?: ReservationStatus[];
      dateFrom?: string;
      dateTo?: string;
      source?: ReservationSource;
    },
  ): Promise<Reservation[]> => {
    const params = new URLSearchParams();
    if (filters?.status)
      filters.status.forEach((s) => params.append('status', s));
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    if (filters?.source) params.set('source', filters.source);
    const response = await api.get<Reservation[]>(
      `/venues/${venueId}/reservations?${params.toString()}`,
    );
    return response.data;
  },

  getOne: async (venueId: string, id: string): Promise<Reservation> => {
    const response = await api.get<Reservation>(
      `/venues/${venueId}/reservations/${id}`,
    );
    return response.data;
  },

  getAvailableSlots: async (
    venueId: string,
    date: string,
    tableType: TableType,
  ): Promise<AvailableSlots> => {
    const response = await api.get<AvailableSlots>(
      `/venues/${venueId}/reservations/available-slots`,
      { params: { date, tableType } },
    );
    return response.data;
  },

  create: async (
    venueId: string,
    data: CreateReservationRequest,
  ): Promise<Reservation> => {
    const response = await api.post<Reservation>(
      `/venues/${venueId}/reservations`,
      data,
    );
    return response.data;
  },

  createByGuest: async (
    venueId: string,
    data: CreateReservationRequest,
  ): Promise<Reservation> => {
    const response = await api.post<Reservation>(
      `/venues/${venueId}/reservations/guest`,
      data,
    );
    return response.data;
  },

  confirm: async (venueId: string, id: string): Promise<Reservation> => {
    const response = await api.patch<Reservation>(
      `/venues/${venueId}/reservations/${id}/confirm`,
    );
    return response.data;
  },

  reject: async (
    venueId: string,
    id: string,
    note?: string,
  ): Promise<Reservation> => {
    const response = await api.patch<Reservation>(
      `/venues/${venueId}/reservations/${id}/reject`,
      { note },
    );
    return response.data;
  },

  recordArrival: async (
    venueId: string,
    id: string,
    outcome: 'COMPLETED' | 'NO_SHOW',
    note?: string,
  ): Promise<Reservation> => {
    const response = await api.patch<Reservation>(
      `/venues/${venueId}/reservations/${id}/arrival`,
      { outcome, note },
    );
    return response.data;
  },

  cancel: async (
    venueId: string,
    id: string,
    reason: string,
  ): Promise<Reservation> => {
    const response = await api.patch<Reservation>(
      `/venues/${venueId}/reservations/${id}/cancel`,
      { reason },
    );
    return response.data;
  },

  rateGuest: async (
    venueId: string,
    id: string,
    data: GuestRatingRequest,
  ): Promise<GuestRating> => {
    const response = await api.post<GuestRating>(
      `/venues/${venueId}/reservations/${id}/rate`,
      data,
    );
    return response.data;
  },

  updateRating: async (
    venueId: string,
    reservationId: string,
    data: GuestRatingRequest,
  ): Promise<GuestRating> => {
    const response = await api.patch<GuestRating>(
      `/venues/${venueId}/reservations/${reservationId}/rate`,
      data,
    );
    return response.data;
  },

  getGuestScore: async (
    venueId: string,
    phone: string,
  ): Promise<{
    averageRating: number | null;
    totalRatings: number;
    totalIncludingAutomatic: number;
    phone: string;
  }> => {
    const response = await api.get<{
      averageRating: number | null;
      totalRatings: number;
      totalIncludingAutomatic: number;
      phone: string;
    }>(`/venues/${venueId}/reservations/guest-score/${encodeURIComponent(phone)}`);
    return response.data;
  },
};
