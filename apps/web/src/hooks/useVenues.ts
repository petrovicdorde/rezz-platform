import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { venuesApi } from '@/lib/api/venues.api';
import type { SendInvitationRequest } from '@/lib/api/venues.api';
import { handleApiError } from '@/lib/handle-error';
import type { CreateVenueRequest } from '@/lib/types/venue.types';
import i18n from '@/i18n';

export const VENUES_QUERY_KEY = ['venues'];

export function useVenues() {
  return useQuery({
    queryKey: VENUES_QUERY_KEY,
    queryFn: venuesApi.getAll,
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: venuesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
      toast.success(i18n.t('venue.created'));
    },
    onError: (error: unknown) => {
      handleApiError(error);
    },
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVenueRequest> }) =>
      venuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
      toast.success(i18n.t('venue.updated'));
    },
    onError: (error: unknown) => {
      handleApiError(error);
    },
  });
}

export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => venuesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
      toast.success(i18n.t('venue.deleted'));
    },
    onError: (error: unknown) => {
      handleApiError(error);
    },
  });
}

export function useToggleVenueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      venuesApi.setActive(id, isActive),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: VENUES_QUERY_KEY });
      toast.success(
        i18n.t(variables.isActive ? 'venue.activated' : 'venue.deactivated'),
      );
    },
    onError: (error: unknown) => {
      handleApiError(error);
    },
  });
}

export function useSendInvitation(venueId: string) {
  return useMutation({
    mutationFn: (data: SendInvitationRequest) =>
      venuesApi.sendInvitation(venueId, data),
    onError: (error: unknown) => {
      handleApiError(error);
    },
  });
}

export function usePublicVenues(filters?: { type?: string; city?: string }) {
  return useQuery({
    queryKey: ['public-venues', filters],
    queryFn: () => venuesApi.searchPublic(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePublicVenue(id: string) {
  return useQuery({
    queryKey: ['public-venue', id],
    queryFn: () => venuesApi.getPublicOne(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
