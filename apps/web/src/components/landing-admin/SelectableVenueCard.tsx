import { Building2, CheckCircle2, Circle } from 'lucide-react';
import type { AdminVenue } from '@/lib/types/venue.types';

interface SelectableVenueCardProps {
  venue: AdminVenue;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function SelectableVenueCard({
  venue,
  isSelected,
  onToggle,
}: SelectableVenueCardProps): React.JSX.Element {
  return (
    <div
      onClick={() => onToggle(venue.id)}
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
      {venue.imageUrl ? (
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="mb-2 h-24 w-full rounded-lg object-cover"
        />
      ) : (
        <div className="mb-2 flex h-24 w-full items-center justify-center rounded-lg bg-tertiary-100">
          <Building2 className="h-8 w-8 text-tertiary-300" />
        </div>
      )}

      <p className="truncate text-sm font-medium text-secondary-600">
        {venue.name}
      </p>
      <p className="text-xs text-tertiary-500">{venue.city}</p>
    </div>
  );
}
