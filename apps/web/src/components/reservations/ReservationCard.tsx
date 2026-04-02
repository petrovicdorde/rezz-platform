import { useTranslation } from 'react-i18next';
import { Phone, MessageSquare, Loader2 } from 'lucide-react';
import { format, parseISO, isToday, isPast } from 'date-fns';
import type { TableType } from '@rezz/shared';
import { Button } from '@/components/ui/button';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import type { Reservation } from '@/lib/types/reservation.types';

const TABLE_TYPE_KEYS: Record<TableType, string> = {
  STANDARD: 'reservation.table_standard',
  BOOTH: 'reservation.table_booth',
  BAR_SEAT: 'reservation.table_bar_seat',
  LOW_TABLE: 'reservation.table_low_table',
  HIGH_TABLE: 'reservation.table_high_table',
  TERRACE: 'reservation.table_terrace',
  VIP: 'reservation.table_vip',
};

interface ReservationCardProps {
  reservation: Reservation;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onArrival?: (id: string) => void;
  onNoShow?: (id: string) => void;
  isConfirming?: boolean;
  isRejecting?: boolean;
  isRecordingArrival?: boolean;
}

export function ReservationCard({
  reservation,
  onConfirm,
  onReject,
  onArrival,
  onNoShow,
  isConfirming,
  isRejecting,
  isRecordingArrival,
}: ReservationCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const dateObj = parseISO(reservation.date);
  const canRecordArrival = isToday(dateObj) || isPast(dateObj);

  return (
    <div
      className={`rounded-xl border border-tertiary-200 bg-white p-4 shadow-sm ${
        reservation.source === 'MANAGER' ? 'border-l-4 border-l-primary-400' : ''
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <ReservationStatusBadge status={reservation.status} />
        {reservation.source === 'MANAGER' && (
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
            {t('reservation.source_manager')}
          </span>
        )}
      </div>

      {/* Name + phone */}
      <div className="mt-2 flex items-center">
        <span className="font-medium text-secondary-600">
          {reservation.firstName} {reservation.lastName}
        </span>
        <span className="ml-3 flex items-center gap-1 text-sm text-tertiary-500">
          <Phone className="h-3.5 w-3.5" />
          {reservation.phone}
        </span>
      </div>

      {/* Details row */}
      <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-tertiary-600">
        <span>{format(dateObj, 'dd.MM.yyyy')}</span>
        <span>·</span>
        <span>{reservation.time}</span>
        <span>·</span>
        <span>{t(TABLE_TYPE_KEYS[reservation.tableType])}</span>
        <span>·</span>
        <span>{t('reservation.guests_count', { count: reservation.numberOfGuests })}</span>
      </div>

      {/* Special request */}
      {reservation.specialRequest && (
        <div className="mt-1 flex items-start gap-1.5">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tertiary-400" />
          <span className="text-sm italic text-tertiary-500">
            {reservation.specialRequest}
          </span>
        </div>
      )}

      {/* Actions */}
      {reservation.status === 'PENDING' && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={isConfirming}
            onClick={() => onConfirm?.(reservation.id)}
          >
            {isConfirming && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {t('reservation.confirm_action')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-500 hover:bg-red-50"
            disabled={isRejecting}
            onClick={() => onReject?.(reservation.id)}
          >
            {t('reservation.reject_action')}
          </Button>
        </div>
      )}

      {reservation.status === 'CONFIRMED' && canRecordArrival && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isRecordingArrival}
            onClick={() => onArrival?.(reservation.id)}
          >
            {isRecordingArrival && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            {t('reservation.arrival_action')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-500 hover:bg-orange-50"
            onClick={() => onNoShow?.(reservation.id)}
          >
            {t('reservation.no_show_action')}
          </Button>
        </div>
      )}
    </div>
  );
}
