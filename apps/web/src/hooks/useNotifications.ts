import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications.api';
import { handleApiError } from '@/lib/handle-error';
import { useAuthStore } from '@/store/auth.store';

const NOTIFICATIONS_KEY = (venueId: string) => ['notifications', venueId];

export function useNotifications() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  return useQuery({
    queryKey: NOTIFICATIONS_KEY(venueId),
    queryFn: () => notificationsApi.getAll(venueId),
    enabled: !!venueId,
    refetchInterval: 60_000,
  });
}

export function useUnreadCount() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  return useQuery({
    queryKey: NOTIFICATIONS_KEY(venueId),
    queryFn: () => notificationsApi.getAll(venueId),
    enabled: !!venueId,
    refetchInterval: 30_000,
    select: (data) =>
      data.filter((n) => !n.isRead && n.type === 'RESERVATION_NEW').length,
  });
}

export function useMarkAsRead() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(venueId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY(venueId) });
    },
    onError: (error: unknown) => handleApiError(error),
  });
}

export function useMarkAllAsRead() {
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY(venueId) });
    },
    onError: (error: unknown) => handleApiError(error),
  });
}
