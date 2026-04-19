import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Car } from 'lucide-react';
import type { PublicVenue } from '@/lib/types/venue.types';

interface VenuePublicCardProps {
  venue: PublicVenue;
  onClick: (venue: PublicVenue) => void;
}

export function VenuePublicCard({
  venue,
  onClick,
}: VenuePublicCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const visibleTags = venue.tags.slice(0, 3);
  const typeLabel = t(`venue.venue_type_${venue.type.toLowerCase()}`);

  return (
    <div
      onClick={() => onClick(venue)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-tertiary-200 bg-white transition-all duration-200 hover:shadow-lg"
    >
      <div className="relative h-44">
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-secondary-600 to-secondary-400">
            <Building2 className="size-10 text-white/40" />
          </div>
        )}

        <div className="absolute top-3 right-3 rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-sm">
          {typeLabel}
        </div>
      </div>

      <div className="p-4">
        <h3 className="truncate text-base font-bold text-secondary-600">
          {venue.name}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-sm text-tertiary-500">
          <MapPin className="size-3" />
          <span>{venue.city}</span>
        </div>

        {visibleTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="text-tertiary-400">
            {venue.hasParking && <Car className="size-3.5" />}
          </div>
          <span className="text-xs font-medium text-primary-600 group-hover:text-primary-800">
            {t('venues_page.card_reserve_cta')}
          </span>
        </div>
      </div>
    </div>
  );
}
