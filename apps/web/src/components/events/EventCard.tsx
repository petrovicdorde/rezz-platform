import { useTranslation } from 'react-i18next';
import { CalendarDays, Tag, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import type { VenueEvent } from '@/lib/types/event.types';

interface EventCardProps {
  event: VenueEvent;
  onClick: (event: VenueEvent) => void;
}

export function EventCard({
  event,
  onClick,
}: EventCardProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-xl border border-tertiary-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onClick(event)}
    >
      {/* Image */}
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.name}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-secondary-100">
          <PartyPopper className="h-10 w-10 text-secondary-300" />
        </div>
      )}

      {/* Content */}
      <div className="relative p-4">
        {/* Active badge */}
        <span
          className={`absolute top-4 right-4 rounded-full px-2 py-0.5 text-xs ${
            event.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {event.isActive ? t('venue.status_active') : t('venue.status_inactive')}
        </span>

        <p className="pr-16 text-sm font-medium text-secondary-600">
          {event.name}
        </p>

        <div className="mt-1 flex items-center gap-1 text-xs text-tertiary-500">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{format(new Date(event.startsAt), 'dd.MM.yyyy HH:mm')}</span>
          {event.endsAt && (
            <span> → {format(new Date(event.endsAt), 'HH:mm')}</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1 text-xs text-tertiary-500">
          {event.promotions.length > 0 ? (
            <>
              <Tag className="h-3.5 w-3.5" />
              <span>
                {t('events.promotions_count', {
                  count: event.promotions.length,
                })}
              </span>
            </>
          ) : (
            <span className="text-tertiary-400">
              {t('events.no_promotions')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
