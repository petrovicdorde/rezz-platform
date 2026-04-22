import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { eventsApi } from '@/lib/api/events.api';
import { handleApiError } from '@/lib/handle-error';
import { useAuthStore } from '@/store/auth.store';
import i18n from '@/i18n';
import type {
  CreateEventRequest,
  CreatePromotionRequest,
} from '@/lib/types/event.types';

const EVENTS_KEY = (venueId: string) => ['events', venueId];

export function useEvents() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  return useQuery({
    queryKey: EVENTS_KEY(venueId),
    queryFn: () => eventsApi.getAll(venueId),
    enabled: !!venueId,
  });
}

export function usePublicEvent(eventId: string) {
  return useQuery({
    queryKey: ['event-public', eventId],
    queryFn: () => eventsApi.getPublicById(eventId),
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => eventsApi.create(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(venueId) });
      toast.success(i18n.t('event.created'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useUpdateEvent() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateEventRequest>;
    }) => eventsApi.update(venueId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(venueId) });
      toast.success(i18n.t('event.updated'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useDeleteEvent() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.remove(venueId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(venueId) });
      toast.success(i18n.t('event.deleted'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useAddPromotion() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: CreatePromotionRequest;
    }) => eventsApi.addPromotion(venueId, eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(venueId) });
      toast.success(i18n.t('event.promotion_created'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useRemovePromotion() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      promotionId,
    }: {
      eventId: string;
      promotionId: string;
    }) => eventsApi.removePromotion(venueId, eventId, promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_KEY(venueId) });
      toast.success(i18n.t('event.promotion_deleted'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
