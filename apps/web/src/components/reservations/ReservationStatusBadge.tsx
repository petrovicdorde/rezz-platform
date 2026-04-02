import { useTranslation } from 'react-i18next';
import type { ReservationStatus } from '@rezz/shared';

const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
};

const STATUS_KEYS: Record<ReservationStatus, string> = {
  PENDING: 'reservation.status_pending',
  CONFIRMED: 'reservation.status_confirmed',
  REJECTED: 'reservation.status_rejected',
  CANCELLED: 'reservation.status_cancelled',
  COMPLETED: 'reservation.status_completed',
  NO_SHOW: 'reservation.status_no_show',
};

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
}

export function ReservationStatusBadge({
  status,
}: ReservationStatusBadgeProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {t(STATUS_KEYS[status])}
    </span>
  );
}
