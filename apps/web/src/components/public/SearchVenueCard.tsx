import { useNavigate } from '@tanstack/react-router';
import { Building2, MapPin, Car, Banknote, CreditCard, Smartphone } from 'lucide-react';
import type { PublicVenue } from '@/lib/types/venue.types';

interface SearchVenueCardProps {
  venue: PublicVenue;
}

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  CASH: Banknote,
  CARD: CreditCard,
  MOBILE: Smartphone,
};

export function SearchVenueCard({
  venue,
}: SearchVenueCardProps): React.JSX.Element {
  const navigate = useNavigate();
  const visibleTags = venue.tags.slice(0, 3);

  return (
    <div
      onClick={() => navigate({ to: `/lokali/${venue.id}` })}
      className="cursor-pointer overflow-hidden rounded-2xl border border-tertiary-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="h-48">
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary-100 to-tertiary-200">
            <Building2 className="h-12 w-12 text-secondary-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-secondary-600">{venue.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-tertiary-500">
          <span>{venue.type}</span>
          <span>·</span>
          <MapPin className="h-3 w-3" />
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
          <div className="flex items-center gap-2 text-tertiary-400">
            {venue.hasParking && <Car className="h-4 w-4" />}
            {venue.paymentMethods.map((pm) => {
              const Icon = PAYMENT_ICONS[pm];
              return Icon ? <Icon key={pm} className="h-4 w-4" /> : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
