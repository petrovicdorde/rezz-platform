import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { employeesApi } from '@/lib/api/employees.api';
import { handleApiError } from '@/lib/handle-error';
import { useAuthStore } from '@/store/auth.store';
import type { InviteEmployeeRequest } from '@/lib/types/employee.types';

const EMPLOYEES_KEY = (venueId: string) => ['employees', venueId];

function useResolvedVenueId(override?: string): string {
  const storeVenueId = useAuthStore((s) => s.user?.venueId ?? '');
  return override ?? storeVenueId;
}

export function useEmployees(venueIdOverride?: string) {
  const venueId = useResolvedVenueId(venueIdOverride);
  return useQuery({
    queryKey: EMPLOYEES_KEY(venueId),
    queryFn: () => employeesApi.getAll(venueId),
    enabled: !!venueId,
  });
}

export function useInviteEmployee(venueIdOverride?: string) {
  const venueId = useResolvedVenueId(venueIdOverride);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteEmployeeRequest) =>
      employeesApi.invite(venueId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY(venueId) });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useUpdateEmployeeRole(venueIdOverride?: string) {
  const venueId = useResolvedVenueId(venueIdOverride);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'MANAGER' | 'WORKER' }) =>
      employeesApi.updateRole(venueId, id, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY(venueId) });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useRemoveEmployee(venueIdOverride?: string) {
  const venueId = useResolvedVenueId(venueIdOverride);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.remove(venueId, id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY(venueId) });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useCancelInvitation(venueIdOverride?: string) {
  const venueId = useResolvedVenueId(venueIdOverride);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      employeesApi.cancelInvitation(venueId, invitationId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY(venueId) });
      toast.success(res.message);
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
