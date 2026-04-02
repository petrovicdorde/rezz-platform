import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, MessageSquare, Star as StarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { TableType } from '@rezz/shared';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/ui/StarRating';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import { GuestRatingForm } from './GuestRatingForm';
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

interface HistoryCardProps {
  reservation: Reservation;
  onRatingSuccess: () => void;
}

export function HistoryCard({
  reservation,
  onRatingSuccess,
}: HistoryCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const dateObj = parseISO(reservation.date);

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
        <span>
          {t('reservation.guests_count', {
            count: reservation.numberOfGuests,
          })}
        </span>
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

      {/* Rating section — only for COMPLETED */}
      {reservation.status === 'COMPLETED' && (
        <div className="mt-3">
          {reservation.guestRating ? (
            <div className="flex items-center gap-2">
              <StarRating
                value={reservation.guestRating.rating}
                readonly
                size={16}
              />
              {reservation.guestRating.note && (
                <span className="text-xs italic text-tertiary-500">
                  {reservation.guestRating.note}
                </span>
              )}
              <span className="text-xs text-tertiary-400">
                {t('history.rated')}
              </span>
            </div>
          ) : !showRatingForm ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-1 w-full"
              onClick={() => setShowRatingForm(true)}
            >
              <StarIcon className="mr-1.5 h-4 w-4" />
              {t('history.rate_guest')}
            </Button>
          ) : (
            <>
              <Separator className="my-3" />
              <GuestRatingForm
                reservationId={reservation.id}
                onSuccess={() => {
                  setShowRatingForm(false);
                  onRatingSuccess();
                }}
                onCancel={() => setShowRatingForm(false)}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
