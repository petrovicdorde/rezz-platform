import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { ReservationDetailDrawer } from '@/components/reservations/ReservationDetailDrawer';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/store/auth.store';
import { requireRole } from '@/lib/route-guards';
import type { Notification } from '@/lib/types/notification.types';

export const Route = createFileRoute('/dashboard/notifications')({
  beforeLoad: () => requireRole(['MANAGER', 'WORKER', 'SUPER_ADMIN']),
  component: NotificationsPage,
});

function NotificationsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');
  const { data: notifications, isLoading } = useNotifications();
  const queryClient = useQueryClient();

  const unreadNotifications = useMemo(
    () =>
      notifications?.filter(
        (n) => !n.isRead && n.type === 'RESERVATION_NEW',
      ) ?? [],
    [notifications],
  );

  function handleActionComplete(): void {
    queryClient.invalidateQueries({ queryKey: ['notifications', venueId] });
    queryClient.invalidateQueries({ queryKey: ['reservations', venueId] });
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <h1 className="text-2xl font-bold text-primary-400">
        {t('notifications.title')}
      </h1>

      {/* Content */}
      <div className="mt-4 overflow-hidden rounded-xl border border-tertiary-200 bg-white">
        {isLoading && (
          <div className="flex flex-col">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse border-b border-tertiary-100 bg-tertiary-100 last:border-0"
              />
            ))}
          </div>
        )}

        {!isLoading && unreadNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="h-12 w-12 text-tertiary-300" />
              <p className="mt-2 text-tertiary-500">
                {t('notifications.no_notifications')}
              </p>
            </div>
          )}

        {!isLoading &&
          unreadNotifications.length > 0 &&
          unreadNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={(n) => setSelectedNotification(n)}
            />
          ))}
      </div>

      {/* Detail drawer */}
      <ReservationDetailDrawer
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onActionComplete={handleActionComplete}
      />
    </DashboardLayout>
  );
}
