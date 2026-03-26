import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import { UserRole } from '@rezz/shared';
import i18n from '@/i18n';
import { authApi, type RegisterRequest } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useLoginStore } from '@/store/login-ui.store';
import { handleApiError } from '@/lib/handle-error';

export const ROLE_REDIRECT: Record<UserRole, string> = {
  SUPER_ADMIN: '/dashboard/venues',
  MANAGER: '/dashboard/reservations',
  WORKER: '/dashboard/arrivals',
  GUEST: '/',
};

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      navigate({ to: '/' });
      toast.success(i18n.t('auth.logout_success'));
    },
    onError: (error) => {
      handleApiError(error);
      logout();
      navigate({ to: '/' });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onError: (error) => {
      handleApiError(error);
    },
  });
}

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
      toast.success(i18n.t('auth.login_success', { name: data.user.firstName }));
      const redirect = ROLE_REDIRECT[data.user.role as UserRole] ?? '/';
      navigate({ to: redirect });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}
