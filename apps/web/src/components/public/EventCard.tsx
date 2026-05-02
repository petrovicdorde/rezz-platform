import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { srLatn } from 'date-fns/locale/sr-Latn';
import { enUS } from 'date-fns/locale/en-US';
import { cn } from '@/lib/utils';
import type { PublicEvent } from '@/lib/types/landing.types';

const EVENT_PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format&fit=crop';

interface EventCardProps {
  event: PublicEvent;
  onClick?: () => void;
  className?: string;
}

export function EventCard({
  event,
  onClick,
  className,
}: EventCardProps): React.JSX.Element {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? enUS : srLatn;

  const startsAt = (() => {
    try {
      return parseISO(event.startsAt);
    } catch {
      return null;
    }
  })();

  const day = startsAt ? format(startsAt, 'd') : '';
  const month = startsAt
    ? format(startsAt, 'MMM', { locale }).toUpperCase().replace(/\.$/, '')
    : '';
  const infoLine = startsAt
    ? format(startsAt, "EEEE, d. MMM — HH:mm", { locale })
    : '';

  const imgSrc = event.imageUrl ?? EVENT_PLACEHOLDER_IMG;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative h-[320px] cursor-pointer overflow-hidden rounded-[22px] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3),0_24px_56px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      {/* Background image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.07]"
        style={{ backgroundImage: `url('${imgSrc}')` }}
      />

      {/* Dark gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,rgba(20,11,0,0.94)_0%,rgba(20,11,0,0.4)_45%,rgba(20,11,0,0.05)_80%,transparent_100%)]"
      />

      {/* Date badge (top-left) */}
      {startsAt && (
        <div className="absolute top-3.5 left-3.5 z-[1] rounded-[12px] bg-gradient-to-br from-secondary-400 to-secondary-500 px-3.5 py-2 leading-none shadow-[0_4px_12px_rgba(249,133,19,0.45),0_8px_24px_rgba(249,133,19,0.2)]">
          <span className="block font-serif text-[1.35rem] font-black text-white">
            {day}
          </span>
          <span className="mt-0.5 block text-[0.58rem] font-bold uppercase tracking-[1.5px] text-white/70">
            {month}
          </span>
        </div>
      )}

      {/* Body (overlaid on bottom) */}
      <div className="absolute right-0 bottom-0 left-0 p-4.5 pt-4">
        <h3 className="truncate font-serif text-[1.22rem] font-bold tracking-[-0.3px] text-white [text-shadow:0_1px_8px_rgba(20,11,0,0.5)]">
          {event.name}
        </h3>
        {infoLine && (
          <p className="mt-1.5 text-[0.76rem] leading-[1.5] text-white/45">
            {infoLine}
          </p>
        )}
      </div>
    </div>
  );
}
