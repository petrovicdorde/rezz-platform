import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { VenueSliderCard } from './VenueSliderCard';
import type { PublicVenue } from '@/lib/types/venue.types';

interface VenueSliderProps {
  venues: PublicVenue[];
}

export function VenueSlider({
  venues,
}: VenueSliderProps): React.JSX.Element {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
    [Autoplay({ delay: 4000, stopOnInteraction: true })],
  );

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4 pl-4 md:pl-0">
        {venues.map((venue) => (
          <div key={venue.id} className="flex-[0_0_auto]">
            <VenueSliderCard venue={venue} />
          </div>
        ))}
      </div>
    </div>
  );
}
