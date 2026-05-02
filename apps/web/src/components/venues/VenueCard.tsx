import { useTranslation } from 'react-i18next';
import { useSettingValueLabel } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

const VENUE_PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop';

interface VenueCardData {
  id: string;
  name: string;
  type: string;
  city: string;
  tags: string[];
  imageUrl: string | null;
  isActive?: boolean;
}

interface VenueCardProps {
  venue: VenueCardData;
  /** `guest` lifts + zooms on hover. `admin` is static and shows a status pill. */
  variant?: 'guest' | 'admin';
  onClick?: () => void;
  className?: string;
}

export function VenueCard({
  venue,
  variant = 'guest',
  onClick,
  className,
}: VenueCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const venueTypeLabel = useSettingValueLabel('VENUE_TYPE');
  const tags = venue.tags.slice(0, 2);
  const typeLabel = venueTypeLabel(venue.type);
  const imgSrc = venue.imageUrl ?? VENUE_PLACEHOLDER_IMG;
  const isGuest = variant === 'guest';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative h-[320px] cursor-pointer overflow-hidden rounded-[22px] shadow-[0_1px_2px_rgba(20,11,0,0.06),0_4px_12px_rgba(20,11,0,0.07),0_12px_28px_rgba(20,11,0,0.07)] transition-all duration-[400ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        isGuest &&
          'hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(20,11,0,0.06),0_8px_24px_rgba(20,11,0,0.1),0_24px_56px_rgba(20,11,0,0.14),0_0_0_1px_rgba(249,133,19,0.1)]',
        className,
      )}
    >
      {/* Background image */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-cover bg-center transition-transform duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          isGuest && 'group-hover:scale-[1.07]',
        )}
        style={{ backgroundImage: `url('${imgSrc}')` }}
      />

      {/* Dark gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,rgba(20,11,0,0.9)_0%,rgba(20,11,0,0.45)_40%,rgba(20,11,0,0.05)_75%,transparent_100%)]"
      />

      {/* Admin status pill (top-right) */}
      {variant === 'admin' && venue.isActive !== undefined && (
        <span
          className={cn(
            'absolute top-3.5 right-3.5 z-[1] rounded-full border px-3 py-1 text-[0.68rem] font-semibold tracking-[0.5px] uppercase backdrop-blur-md',
            venue.isActive
              ? 'border-emerald-400/40 bg-emerald-500/25 text-emerald-50'
              : 'border-red-400/40 bg-red-500/25 text-red-50',
          )}
        >
          {venue.isActive
            ? t('venue.status_active')
            : t('venue.status_inactive')}
        </span>
      )}

      {/* Content (overlaid on bottom) */}
      <div className="absolute right-0 bottom-0 left-0 p-5 pt-4">
        {tags.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[0.68rem] font-medium text-white/65 backdrop-blur-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="truncate font-serif text-[1.25rem] font-bold tracking-[-0.4px] text-white [text-shadow:0_1px_8px_rgba(20,11,0,0.5)]">
          {venue.name}
        </h3>
        <div className="mt-1.5 text-[0.77rem] text-white/45">
          {typeLabel} ·{' '}
          <strong className="font-medium text-white/70">{venue.city}</strong>
        </div>
      </div>
    </div>
  );
}
