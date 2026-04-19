import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  profileApi,
  type UpdateProfileRequest,
} from '@/lib/api/profile.api';
import { handleApiError } from '@/lib/handle-error';
import { useAuthStore } from '@/store/auth.store';
import i18n from '@/i18n';

const PROFILE_KEY = ['profile'];
const MY_RESERVATIONS_KEY = ['my-reservations'];

export function useMyProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: profileApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser, user } = useAuthStore();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      if (user) {
        setUser({
          ...user,
          firstName: updated.firstName ?? user.firstName,
          lastName: updated.lastName ?? user.lastName,
          phone: updated.phone ?? user.phone ?? null,
        });
      }
      toast.success(i18n.t('profile.profile_updated'));
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useMyReservations() {
  return useQuery({
    queryKey: MY_RESERVATIONS_KEY,
    queryFn: profileApi.getMyReservations,
  });
}

export function useCancelMyReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      profileApi.cancelReservation(id, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: MY_RESERVATIONS_KEY });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
