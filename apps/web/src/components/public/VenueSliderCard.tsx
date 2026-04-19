import { useNavigate } from '@tanstack/react-router';
import type { PublicVenue } from '@/lib/types/venue.types';

interface VenueSliderCardProps {
  venue: PublicVenue;
}

export function VenueSliderCard({
  venue,
}: VenueSliderCardProps): React.JSX.Element {
  const navigate = useNavigate();

  const visibleTags = venue.tags.slice(0, 2);

  return (
    <div
      onClick={() => navigate({ to: `/lokali/${venue.id}` })}
      className="relative aspect-[3/4] min-w-[220px] cursor-pointer overflow-hidden rounded-2xl md:min-w-[260px]"
    >
      {/* Background */}
      {venue.imageUrl ? (
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-secondary-600 to-secondary-400" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-bold leading-tight text-white">
          {venue.name}
        </h3>
        <p className="mt-1 text-sm text-white/70">{venue.city}</p>
        {visibleTags.length > 0 && (
          <div className="mt-2 flex gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/30 px-2 py-0.5 text-xs text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
