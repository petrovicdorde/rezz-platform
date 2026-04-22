import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus, CalendarX } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SwiperFilterChips } from '@/components/ui/SwiperFilterChips';
import { Button } from '@/components/ui/button';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { ReservationFormModal } from '@/components/reservations/ReservationFormModal';
import { ReservationFormDrawer } from '@/components/reservations/ReservationFormDrawer';
import { ReservationNoteModal } from '@/components/reservations/ReservationNoteModal';
import { CancelReservationModal } from '@/components/reservations/CancelReservationModal';
import { CancelReservationDrawer } from '@/components/reservations/CancelReservationDrawer';
import {
  useReservations,
  useConfirmReservation,
  useRejectReservation,
  useRecordArrival,
} from '@/hooks/useReservations';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { requireRole } from '@/lib/route-guards';
import type { ReservationStatus } from '@rezz/shared';

export const Route = createFileRoute('/dashboard/reservations')({
  beforeLoad: () => requireRole(['MANAGER', 'WORKER', 'SUPER_ADMIN']),
  component: ReservationsPage,
});

type FilterType = 'today' | 'tomorrow' | 'week' | 'all';

function ReservationsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('today');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ id: string; name: string } | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const weekEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd');

  const filters = useMemo(() => {
    const status: ReservationStatus[] = ['CONFIRMED'];
    switch (activeFilter) {
      case 'today':
        return { dateFrom: today, dateTo: today, status };
      case 'tomorrow':
        return { dateFrom: tomorrow, dateTo: tomorrow, status };
      case 'week':
        return { dateFrom: today, dateTo: weekEnd, status };
      case 'all':
        return { status };
    }
  }, [activeFilter, today, tomorrow, weekEnd]);

  const { data: reservations, isLoading, isError } = useReservations(filters);
  const confirmMutation = useConfirmReservation();
  const rejectMutation = useRejectReservation();
  const arrivalMutation = useRecordArrival();

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'today', label: t('reservation.filter_today') },
    { key: 'tomorrow', label: t('reservation.filter_tomorrow') },
    { key: 'week', label: t('reservation.filter_week') },
    { key: 'all', label: t('reservation.filter_all') },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-400">
          {t('reservation.title')}
        </h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="hidden gap-2 bg-primary-400 text-white hover:bg-primary-600 md:inline-flex"
        >
          <Plus className="h-4 w-4" />
          {t('reservation.new')}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="mt-4">
        <SwiperFilterChips
          chips={filterButtons}
          activeKey={activeFilter}
          onChange={(key) => setActiveFilter(key as FilterType)}
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

        {!isLoading && !isError && reservations && reservations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarX className="h-12 w-12 text-tertiary-300" />
            <p className="mt-3 text-tertiary-500">
              {t('reservation.no_reservations')}
            </p>
          </div>
        )}

        {!isLoading && !isError && reservations && reservations.length > 0 && (
          <div className="flex flex-col gap-3">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onConfirm={(id) => confirmMutation.mutate(id)}
                onReject={(id) => setRejectTarget(id)}
                onArrival={(id) =>
                  arrivalMutation.mutate({ id, outcome: 'COMPLETED' })
                }
                onNoShow={(id) =>
                  arrivalMutation.mutate({ id, outcome: 'NO_SHOW' })
                }
                onClick={(id) => {
                  const res = reservations?.find((r) => r.id === id);
                  if (res && (res.status === 'PENDING' || res.status === 'CONFIRMED')) {
                    setCancelTarget({
                      id,
                      name: `${res.firstName} ${res.lastName}`,
                    });
                  }
                }}
                isConfirming={confirmMutation.isPending}
                isRejecting={rejectMutation.isPending}
                isRecordingArrival={arrivalMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-400 shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Form modal/drawer */}
      {isMobile ? (
        <ReservationFormDrawer
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      ) : (
        <ReservationFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* Reject note modal */}
      <ReservationNoteModal
        isOpen={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        title={t('reservation.reject_action')}
        confirmLabel={t('reservation.reject_action')}
        confirmClassName="bg-red-600 text-white hover:bg-red-700"
        isPending={rejectMutation.isPending}
        onConfirm={(note) => {
          if (!rejectTarget) return;
          rejectMutation.mutate(
            { id: rejectTarget, note },
            { onSuccess: () => setRejectTarget(null) },
          );
        }}
      />

      {/* Cancel modal/drawer */}
      {isMobile ? (
        <CancelReservationDrawer
          isOpen={cancelTarget !== null}
          onClose={() => setCancelTarget(null)}
          reservationId={cancelTarget?.id ?? null}
          guestName={cancelTarget?.name ?? ''}
        />
      ) : (
        <CancelReservationModal
          isOpen={cancelTarget !== null}
          onClose={() => setCancelTarget(null)}
          reservationId={cancelTarget?.id ?? null}
          guestName={cancelTarget?.name ?? ''}
        />
      )}
    </DashboardLayout>
  );
}
