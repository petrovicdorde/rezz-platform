import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Calendar, Clock, Users, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Reservation } from '@/lib/types/reservation.types';

interface BookingSuccessViewProps {
  reservation: Reservation;
  venueName: string;
  onNewReservation: () => void;
}

const TABLE_TYPE_KEYS: Record<string, string> = {
  STANDARD: 'venue.table_standard',
  BOOTH: 'venue.table_booth',
  BAR_SEAT: 'venue.table_bar_seat',
  LOW_TABLE: 'venue.table_low_table',
  HIGH_TABLE: 'venue.table_high_table',
  TERRACE: 'venue.table_terrace',
  VIP: 'venue.table_vip',
};

export function BookingSuccessView({
  reservation,
  venueName,
  onNewReservation,
}: BookingSuccessViewProps): React.JSX.Element {
  const { t } = useTranslation();
  const formattedDate = format(parseISO(reservation.date), 'dd.MM.yyyy');

  return (
    <div className="flex flex-col items-center text-center">
      <CheckCircle2 className="size-14 text-primary-400" />
      <h3 className="mt-4 text-xl font-bold text-secondary-600">
        {t('booking.success_title')}
      </h3>
      <p className="mt-2 text-sm text-tertiary-500">
        {t('booking.success_subtitle')}
      </p>

      <div className="mt-6 w-full rounded-xl border border-tertiary-200 bg-tertiary-50 p-4 text-left">
        <div className="flex items-center justify-between border-b border-tertiary-100 py-2">
          <span className="text-xs text-tertiary-500">
            {t('booking.venue_label')}
          </span>
          <span className="text-sm font-medium text-secondary-600">
            {venueName}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-tertiary-100 py-2">
          <span className="flex items-center gap-1 text-xs text-tertiary-500">
            <Calendar className="size-3.5" />
            {t('booking.date_label')}
          </span>
          <span className="text-sm font-medium text-secondary-600">
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-tertiary-100 py-2">
          <span className="flex items-center gap-1 text-xs text-tertiary-500">
            <Clock className="size-3.5" />
            {t('booking.time_label')}
          </span>
          <span className="text-sm font-medium text-secondary-600">
            {reservation.time}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-tertiary-100 py-2">
          <span className="flex items-center gap-1 text-xs text-tertiary-500">
            <Users className="size-3.5" />
            {t('booking.guests_label')}
          </span>
          <span className="text-sm font-medium text-secondary-600">
            {reservation.numberOfGuests}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="flex items-center gap-1 text-xs text-tertiary-500">
            <Utensils className="size-3.5" />
            {t('booking.table_type_label')}
          </span>
          <span className="text-sm font-medium text-secondary-600">
            {t(TABLE_TYPE_KEYS[reservation.tableType] ?? reservation.tableType)}
          </span>
        </div>
      </div>

      <span className="mt-4 rounded-full bg-secondary-100 px-3 py-1 text-xs font-medium text-secondary-600">
        {t('booking.status_pending')}
      </span>

      <Button
        onClick={onNewReservation}
        variant="outline"
        className="mt-6"
      >
        {t('booking.new_reservation')}
      </Button>
    </div>
  );
}
