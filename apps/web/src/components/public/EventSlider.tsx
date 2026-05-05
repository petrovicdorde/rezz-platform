import { useNavigate } from '@tanstack/react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { EventCard } from './EventCard';
import type { PublicEvent } from '@/lib/types/landing.types';

interface EventSliderProps {
  events: PublicEvent[];
}

export function EventSlider({ events }: EventSliderProps): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="-mx-[5%] -my-4">
      <Swiper
        slidesPerView="auto"
        spaceBetween={14}
        grabCursor
        loop={events.length > 1}
        className="!px-[5%] !py-4"
        breakpoints={{
          640: { spaceBetween: 16 },
          768: { spaceBetween: 20 },
          1024: { spaceBetween: 24 },
        }}
      >
        {events.map((event) => (
          <SwiperSlide
            key={event.id}
            className="!w-[78vw] !max-w-[320px] sm:!w-[44%] md:!w-[44%] lg:!w-[31%] xl:!w-[23.5%]"
          >
            <EventCard
              event={event}
              onClick={() => navigate({ to: `/dogadjaji/${event.id}` })}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
