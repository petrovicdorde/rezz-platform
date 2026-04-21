import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  usersAdminApi,
  type UsersAdminFilters,
} from '@/lib/api/users-admin.api';
import { handleApiError } from '@/lib/handle-error';

export function useAdminUsers(filters?: UsersAdminFilters) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => usersAdminApi.getAll(filters),
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersAdminApi.setActive(id, isActive),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useSetUserBlacklisted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      isBlacklisted,
      reason,
    }: {
      id: string;
      isBlacklisted: boolean;
      reason?: string;
    }) => usersAdminApi.setBlacklisted(id, isBlacklisted, reason),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersAdminApi.remove(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
