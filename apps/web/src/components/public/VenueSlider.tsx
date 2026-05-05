import { useNavigate } from '@tanstack/react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { VenuePublicCard } from './VenuePublicCard';
import type { PublicVenue } from '@/lib/types/venue.types';

interface VenueSliderProps {
  venues: PublicVenue[];
}

export function VenueSlider({
  venues,
}: VenueSliderProps): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="-mx-[5%] -my-4">
      <Swiper
        slidesPerView="auto"
        spaceBetween={14}
        grabCursor
        loop={venues.length > 1}
        className="!px-[5%] !py-4"
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
            <VenuePublicCard
              venue={venue}
              onClick={(v) => navigate({ to: `/lokali/${v.id}` })}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
