import { useNavigate } from '@tanstack/react-router';
import { VenueCard } from '@/components/venues/VenueCard';
import type { PublicVenue } from '@/lib/types/venue.types';

interface VenueSliderCardProps {
  venue: PublicVenue;
}

export function VenueSliderCard({
  venue,
}: VenueSliderCardProps): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="min-w-[260px] sm:min-w-[280px]">
      <VenueCard
        venue={venue}
        variant="guest"
        onClick={() => navigate({ to: `/lokali/${venue.id}` })}
      />
    </div>
  );
}
