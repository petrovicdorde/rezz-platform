import { VenueCard } from '@/components/venues/VenueCard';
import type { PublicVenue } from '@/lib/types/venue.types';

interface VenuePublicCardProps {
  venue: PublicVenue;
  onClick: (venue: PublicVenue) => void;
}

export function VenuePublicCard({
  venue,
  onClick,
}: VenuePublicCardProps): React.JSX.Element {
  return (
    <VenueCard
      venue={venue}
      variant="guest"
      onClick={() => onClick(venue)}
    />
  );
}
