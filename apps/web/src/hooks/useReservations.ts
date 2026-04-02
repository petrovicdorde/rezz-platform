import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { reservationsApi } from '@/lib/api/reservations.api';
import { handleApiError } from '@/lib/handle-error';
import { useAuthStore } from '@/store/auth.store';
import i18n from '@/i18n';
import type { ReservationStatus, ReservationSource, TableType } from '@rezz/shared';
import type {
  CreateReservationRequest,
  GuestRatingRequest,
} from '@/lib/types/reservation.types';

export const RESERVATIONS_KEY = (venueId: string) => ['reservations', venueId];

export function useReservations(filters?: {
  status?: ReservationStatus[];
  dateFrom?: string;
  dateTo?: string;
  source?: ReservationSource;
}) {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  return useQuery({
    queryKey: [...RESERVATIONS_KEY(venueId), filters],
    queryFn: () => reservationsApi.getAll(venueId, filters),
    enabled: !!venueId,
  });
}

export function useAvailableSlots(date: string, tableType: TableType) {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  return useQuery({
    queryKey: ['available-slots', venueId, date, tableType],
    queryFn: () => reservationsApi.getAvailableSlots(venueId, date, tableType),
    enabled: !!venueId && !!date && !!tableType,
  });
}

export function useCreateReservation() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReservationRequest) =>
      reservationsApi.create(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY(venueId) });
      toast.success(i18n.t('reservation.created'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useConfirmReservation() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.confirm(venueId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY(venueId) });
      toast.success(i18n.t('reservation.confirmed'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useRejectReservation() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      reservationsApi.reject(venueId, id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY(venueId) });
      toast.success(i18n.t('reservation.rejected'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useRecordArrival() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      outcome,
      note,
    }: {
      id: string;
      outcome: 'COMPLETED' | 'NO_SHOW';
      note?: string;
    }) => reservationsApi.recordArrival(venueId, id, outcome, note),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY(venueId) });
      toast.success(
        vars.outcome === 'COMPLETED'
          ? i18n.t('reservation.arrived')
          : i18n.t('reservation.no_show'),
      );
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useCancelReservation() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      reservationsApi.cancel(venueId, id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY(venueId) });
      toast.success(i18n.t('reservation.cancelled'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useRateGuest() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reservationId,
      data,
    }: {
      reservationId: string;
      data: GuestRatingRequest;
    }) => reservationsApi.rateGuest(venueId, reservationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY(venueId) });
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
