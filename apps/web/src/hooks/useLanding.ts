import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { landingApi } from '@/lib/api/landing.api';
import { handleApiError } from '@/lib/handle-error';
import i18n from '@/i18n';
import type { UpdateLandingConfigRequest } from '@/lib/types/landing.types';

export const LANDING_DATA_KEY = ['landing-data'];
export const LANDING_CONFIG_KEY = ['landing-config'];

export function useLandingData() {
  return useQuery({
    queryKey: LANDING_DATA_KEY,
    queryFn: landingApi.getLandingData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminLandingConfig() {
  return useQuery({
    queryKey: LANDING_CONFIG_KEY,
    queryFn: landingApi.getAdminConfig,
  });
}

export function useUpdateLandingConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateLandingConfigRequest) =>
      landingApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LANDING_CONFIG_KEY });
      queryClient.invalidateQueries({ queryKey: LANDING_DATA_KEY });
      toast.success(i18n.t('landing_admin.config_saved'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
