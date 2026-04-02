import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, MapPin, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useDeleteEvent } from '@/hooks/useEvents';
import type { VenueEvent } from '@/lib/types/event.types';

interface EventDetailContentProps {
  event: VenueEvent;
  onClose: () => void;
  onEdit: (event: VenueEvent) => void;
}

export function EventDetailContent({
  event,
  onClose,
  onEdit,
}: EventDetailContentProps): React.JSX.Element {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteEvent = useDeleteEvent();

  return (
    <div>
      {/* Image */}
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.name}
          className="mb-4 h-40 w-full rounded-lg object-cover"
        />
      )}

      {/* Info */}
      <h2 className="text-lg font-medium text-secondary-600">{event.name}</h2>

      <div className="mt-2 flex items-center gap-1.5 text-sm text-tertiary-500">
        <MapPin className="h-3.5 w-3.5" />
        <span>{event.address}</span>
      </div>

      <div className="mt-1 flex items-center gap-1.5 text-sm text-tertiary-500">
        <CalendarDays className="h-3.5 w-3.5" />
        <span>{format(new Date(event.startsAt), 'dd.MM.yyyy HH:mm')}</span>
        {event.endsAt && (
          <span> → {format(new Date(event.endsAt), 'dd.MM.yyyy HH:mm')}</span>
        )}
      </div>

      {event.description && (
        <p className="mt-2 text-sm italic text-tertiary-600">
          {event.description}
        </p>
      )}

      {/* Promotions */}
      <Separator className="my-4" />
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-secondary-600">
        {t('events.promotions_section')}
      </h3>

      {event.promotions.length === 0 ? (
        <p className="text-sm text-tertiary-400">{t('events.no_promotions')}</p>
      ) : (
        <div>
          {event.promotions.map((promo) => (
            <div
              key={promo.id}
              className="flex items-center justify-between border-b border-tertiary-100 py-2 last:border-0"
            >
              <span className="text-sm text-secondary-600">{promo.name}</span>
              <span className="text-sm font-medium text-primary-600">
                {Number(promo.price).toFixed(2)} KM
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6">
        {!confirmDelete && (
          <>
            <Button
              className="w-full bg-primary-400 text-white hover:bg-primary-600"
              onClick={() => onEdit(event)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t('events.edit')}
            </Button>
            <Button
              variant="outline"
              className="mt-2 w-full border-red-300 text-red-500 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('events.delete')}
            </Button>
          </>
        )}

        {confirmDelete && (
          <div>
            <p className="mb-3 text-center text-sm text-secondary-600">
              {t('events.delete_confirm', { name: event.name })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={deleteEvent.isPending}
                onClick={() =>
                  deleteEvent.mutate(event.id, { onSuccess: onClose })
                }
              >
                {deleteEvent.isPending
                  ? t('common.loading')
                  : t('events.delete_confirm_yes')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
