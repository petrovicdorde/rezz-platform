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
        <h2 className="font-serif text-2xl font-bold tracking-[-0.5px] text-secondary-400">
          {categoryLabel}
        </h2>
      </div>

      {/* `-my-4` + `!py-4` gives the lifted card and its shadow vertical
          breathing room without changing the section's visual rhythm. `loop`
          enables continuous swiping when there are enough slides; Swiper
          auto-disables it when there are too few. */}
      <div className="-my-4">
        <Swiper
          slidesPerView="auto"
          spaceBetween={14}
          grabCursor
          loop={venues.length > 1}
          className="w-full !py-4"
          breakpoints={{
            640: { spaceBetween: 16 },
            768: { spaceBetween: 20 },
            1024: { spaceBetween: 24 },
          }}
        >
          {venues.map((venue) => (
            <SwiperSlide
              key={venue.id}
              className="!w-[78vw] !max-w-[320px] sm:!w-[44%] md:!w-[44%] lg:!w-[31%] xl:!w-[23.5%]"
            >
              <VenuePublicCard venue={venue} onClick={onVenueClick} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
