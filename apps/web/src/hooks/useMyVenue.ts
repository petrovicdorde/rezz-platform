import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { myVenueApi, type UpdateMyVenueRequest } from '@/lib/api/my-venue.api';
import { handleApiError } from '@/lib/handle-error';
import i18n from '@/i18n';
import { useAuthStore } from '@/store/auth.store';

const MY_VENUE_KEY = ['my-venue'];

export function useMyVenue() {
  const role = useAuthStore((s) => s.user?.role);
  return useQuery({
    queryKey: MY_VENUE_KEY,
    queryFn: () => myVenueApi.get(),
    enabled: role === 'MANAGER',
  });
}

export function useUpdateMyVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMyVenueRequest) => myVenueApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_VENUE_KEY });
      toast.success(i18n.t('venue.updated'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
