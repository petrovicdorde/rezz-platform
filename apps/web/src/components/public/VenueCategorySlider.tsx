import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import type { PublicVenue } from '@/lib/types/venue.types';
import { VenuePublicCard } from './VenuePublicCard';

interface VenueCategorySliderProps {
  categoryLabel: string;
  venues: PublicVenue[];
  onVenueClick: (venue: PublicVenue) => void;
}

export function VenueCategorySlider({
  categoryLabel,
  venues,
  onVenueClick,
}: VenueCategorySliderProps): React.JSX.Element {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-secondary-600">
          {categoryLabel}
        </h2>
      </div>

      <Swiper
        slidesPerView="auto"
        slidesPerGroup={1}
        spaceBetween={12}
        className="w-full"
      >
        {venues.map((venue) => (
          <SwiperSlide
            key={venue.id}
            style={{ width: '72vw', maxWidth: '280px' }}
          >
            <VenuePublicCard venue={venue} onClick={onVenueClick} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
