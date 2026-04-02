import { PartyPopper, CheckCircle2, Circle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { VenueEvent } from '@/lib/types/event.types';

interface SelectableEventCardProps {
  event: VenueEvent;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function SelectableEventCard({
  event,
  isSelected,
  onToggle,
}: SelectableEventCardProps): React.JSX.Element {
  return (
    <div
      onClick={() => onToggle(event.id)}
      className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all ${
        isSelected
          ? 'border-primary-400 bg-primary-50'
          : 'border-tertiary-200 bg-white hover:border-tertiary-400'
      }`}
    >
      {/* Checkmark */}
      <div className="absolute top-2 right-2">
        {isSelected ? (
          <CheckCircle2 className="h-5 w-5 fill-primary-50 text-primary-400" />
        ) : (
          <Circle className="h-5 w-5 text-tertiary-300" />
        )}
      </div>

      {/* Image */}
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.name}
          className="mb-2 h-24 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="mb-2 flex h-24 w-full items-center justify-center rounded-lg bg-tertiary-100">
          <PartyPopper className="h-8 w-8 text-tertiary-300" />
        </div>
      )}

      <p className="truncate text-sm font-medium text-secondary-600">
        {event.name}
      </p>
      <p className="text-xs text-tertiary-500">
        {format(parseISO(event.startsAt), 'dd.MM.yyyy HH:mm')}
      </p>
      {event.promotions.length > 0 && (
        <p className="mt-0.5 text-xs text-tertiary-400">
          {event.promotions.length} promocija
        </p>
      )}
    </div>
  );
}
