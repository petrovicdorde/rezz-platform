import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SwiperFilterChips } from '@/components/ui/SwiperFilterChips';
import { HistoryCard } from '@/components/reservations/HistoryCard';
import { useReservations, RESERVATIONS_KEY } from '@/hooks/useReservations';
import { useAuthStore } from '@/store/auth.store';
import { requireRole } from '@/lib/route-guards';
import type { ReservationStatus } from '@rezz/shared';

export const Route = createFileRoute('/dashboard/history')({
  beforeLoad: () => requireRole(['MANAGER', 'SUPER_ADMIN']),
  component: HistoryPage,
});

const STATUS_MAP: Record<string, ReservationStatus[]> = {
  all: ['COMPLETED', 'NO_SHOW', 'CANCELLED', 'REJECTED'],
  completed: ['COMPLETED'],
  no_show: ['NO_SHOW'],
  cancelled: ['CANCELLED'],
  rejected: ['REJECTED'],
};

function HistoryPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const queryClient = useQueryClient();
  const venueId = useAuthStore((s) => s.user?.venueId ?? '');

  const chips = [
    { key: 'all', label: t('history.filter_all') },
    { key: 'completed', label: t('history.filter_completed') },
    { key: 'no_show', label: t('history.filter_no_show') },
    { key: 'cancelled', label: t('history.filter_cancelled') },
    { key: 'rejected', label: t('history.filter_rejected') },
  ];

  const filters = useMemo(
    () => ({ status: STATUS_MAP[activeFilter] }),
    [activeFilter],
  );

  const { data: reservations, isLoading, isError } = useReservations(filters);

  function handleRatingSuccess(): void {
    queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY(venueId) });
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <h1 className="text-2xl font-bold text-primary-400">
        {t('history.title')}
      </h1>

      {/* Filter chips */}
      <div className="mt-4">
        <SwiperFilterChips
          chips={chips}
          activeKey={activeFilter}
          onChange={setActiveFilter}
        />
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-tertiary-200"
              />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-red-500">{t('common.error')}</p>
        )}

        {!isLoading &&
          !isError &&
          reservations &&
          reservations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Clock className="h-12 w-12 text-tertiary-300" />
              <p className="mt-3 text-tertiary-500">
                {t('history.no_history')}
              </p>
            </div>
          )}

        {!isLoading &&
          !isError &&
          reservations &&
          reservations.length > 0 && (
            <div className="flex flex-col gap-3">
              {reservations.map((reservation) => (
                <HistoryCard
                  key={reservation.id}
                  reservation={reservation}
                  onRatingSuccess={handleRatingSuccess}
                />
              ))}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
