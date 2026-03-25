import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { UserRole } from '@rezz/shared';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useLoginStore } from '@/store/login-ui.store';
import { ApiError } from '@/lib/types/auth.types';

const ROLE_REDIRECT: Record<UserRole, string> = {
  SUPER_ADMIN: '/dashboard/venues',
  MANAGER: '/dashboard/reservations',
  WORKER: '/dashboard/arrivals',
  GUEST: '/',
};

export function useLogin() {
  const { setAuth } = useAuthStore();
  const { close } = useLoginStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(
        {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role as UserRole,
        },
        data.accessToken,
        data.refreshToken,
      );
      close();
      toast.success(`Dobrodošli, ${data.user.firstName}!`);
      const redirect = ROLE_REDIRECT[data.user.role as UserRole] ?? '/';
      navigate({ to: redirect });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message;
      const text = Array.isArray(message) ? message[0] : message;
      toast.error(text ?? 'Greška pri prijavi. Pokušajte ponovo.');
    },
  });
}
