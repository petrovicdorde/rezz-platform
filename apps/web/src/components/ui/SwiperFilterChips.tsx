import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

interface FilterChip {
  key: string;
  label: string;
}

interface SwiperFilterChipsProps {
  chips: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function SwiperFilterChips({
  chips,
  activeKey,
  onChange,
}: SwiperFilterChipsProps): React.JSX.Element {
  return (
    <Swiper
      modules={[FreeMode]}
      slidesPerView="auto"
      spaceBetween={8}
      freeMode
      className="w-full"
    >
      {chips.map((chip) => (
        <SwiperSlide key={chip.key} style={{ width: 'auto' }}>
          <button
            onClick={() => onChange(chip.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeKey === chip.key
                ? 'bg-primary-400 text-white'
                : 'border border-tertiary-200 bg-white text-tertiary-600 hover:border-tertiary-400'
            }`}
          >
            {chip.label}
          </button>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
