import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { venuesApi } from '@/lib/api/venues.api';
import { handleApiError } from '@/lib/handle-error';
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
