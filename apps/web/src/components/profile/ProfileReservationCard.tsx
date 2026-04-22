import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { ChevronUp, Loader2 } from 'lucide-react';
import { ReservationStatusBadge } from '@/components/reservations/ReservationStatusBadge';
import { Collapsible } from '@/components/ui/collapsible';
import { useCancelMyReservation } from '@/hooks/useProfile';
import { useSettingValueLabel } from '@/hooks/useSettings';
import type { Reservation } from '@/lib/types/reservation.types';

type ExpandedSection = 'none' | 'details' | 'cancel';

interface ProfileReservationCardProps {
  reservation: Reservation & { venue?: { name: string } | null };
  showCancelButton: boolean;
}

export function ProfileReservationCard({
  reservation,
  showCancelButton,
}: ProfileReservationCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const tableTypeLabel = useSettingValueLabel('TABLE_TYPE');
  const [expanded, setExpanded] = useState<ExpandedSection>('none');
  const [cancelReason, setCancelReason] = useState('');
  const cancelMutation = useCancelMyReservation();

  const dateObj = parseISO(reservation.date);
  const venueName = reservation.venue?.name ?? t('profile.venue_label');

  const isDetails = expanded === 'details';
  const isCancel = expanded === 'cancel';
  const showActions = expanded === 'none';

  const cancelDisabled =
    cancelReason.trim().length < 3 || cancelMutation.isPending;

  function handleCancelSubmit(): void {
    cancelMutation.mutate(
      { id: reservation.id, reason: cancelReason },
      {
        onSuccess: () => {
          setExpanded('none');
          setCancelReason('');
        },
      },
    );
  }

  function openDetails(): void {
    setExpanded('details');
  }

  function closeDetails(): void {
    setExpanded('none');
  }

  function openCancel(): void {
    setExpanded('cancel');
  }

  function closeCancel(): void {
    setExpanded('none');
    setCancelReason('');
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-4 transition-colors duration-300 ${
        isCancel ? 'border-red-300' : 'border-tertiary-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-secondary-600">{venueName}</span>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-tertiary-500">
        <span>{format(dateObj, 'dd.MM.yyyy')}</span>
        <span>·</span>
        <span>{reservation.time}</span>
        <span>·</span>
        <span>{tableTypeLabel(reservation.tableType)}</span>
        <span>·</span>
        <span>{reservation.numberOfGuests}</span>
      </div>

      {/* Inline details accordion */}
      <Collapsible open={isDetails}>
        <div className="mt-3 space-y-2 border-t border-tertiary-100 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-tertiary-500">
              {t('profile.venue_label')}
            </span>
            <span className="font-medium text-secondary-600">{venueName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tertiary-500">
              {t('profile.date_label')}
            </span>
            <span className="text-secondary-600">
              {format(dateObj, 'dd.MM.yyyy')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tertiary-500">
              {t('profile.time_label')}
            </span>
            <span className="text-secondary-600">{reservation.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tertiary-500">
              {t('profile.table_label')}
            </span>
            <span className="text-secondary-600">
              {tableTypeLabel(reservation.tableType)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-tertiary-500">
              {t('profile.guests_label')}
            </span>
            <span className="text-secondary-600">
              {reservation.numberOfGuests}
            </span>
          </div>
          {reservation.specialRequest && (
            <div className="pt-1">
              <p className="text-tertiary-500">
                {t('profile.special_request_label')}
              </p>
              <p className="italic text-secondary-600">
                {reservation.specialRequest}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={closeDetails}
              aria-label={t('profile.hide_details')}
              title={t('profile.hide_details')}
              className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-tertiary-200 bg-tertiary-50 text-tertiary-600 shadow-sm transition-all duration-300 hover:border-secondary-200 hover:bg-secondary-50 hover:text-secondary-600 hover:shadow-md"
            >
              <ChevronUp
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </Collapsible>

      {/* Action buttons (visible only when nothing expanded) */}
      <Collapsible open={showActions}>
        <div className="pt-3">
          {reservation.specialRequest && (
            <p className="mb-3 text-xs italic text-tertiary-400">
              {reservation.specialRequest}
            </p>
          )}

          <div
            className={`grid gap-2 ${
              showCancelButton ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            <button
              type="button"
              onClick={openDetails}
              className="cursor-pointer rounded-lg border border-tertiary-200 py-2 text-sm text-secondary-600 transition-colors hover:bg-tertiary-50"
            >
              {t('profile.reservation_details')}
            </button>

            {showCancelButton && (
              <button
                type="button"
                onClick={openCancel}
                className="cursor-pointer rounded-lg border border-red-300 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        </div>
      </Collapsible>

      {/* Cancel form accordion */}
      <Collapsible open={isCancel}>
        <div className="mt-3 border-t border-tertiary-100 pt-3">
          <p className="mb-3 text-sm font-medium text-secondary-600">
            {t('profile.cancel_confirm_question')}
          </p>

          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('profile.cancel_reason_label')} *
          </label>
          <textarea
            rows={2}
            placeholder={t('profile.cancel_reason_placeholder')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full resize-none rounded-xl border border-tertiary-200 p-3 text-sm transition-colors focus:border-red-400 focus:outline-none"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={closeCancel}
              className="cursor-pointer rounded-xl border border-tertiary-200 py-2 text-sm text-secondary-600 transition-colors hover:bg-tertiary-50"
            >
              {t('profile.cancel_back_btn')}
            </button>
            <button
              type="button"
              disabled={cancelDisabled}
              onClick={handleCancelSubmit}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 py-2 text-sm text-white transition-opacity hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {t('profile.cancel_confirm_btn')}
            </button>
          </div>
        </div>
      </Collapsible>
    </div>
  );
}
