import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { useGuestScore } from '@/hooks/useReservations';

interface GuestScoreBadgeProps {
  phone: string;
  inline?: boolean;
}

export function GuestScoreBadge({
  phone,
  inline = false,
}: GuestScoreBadgeProps): React.JSX.Element | null {
  const { t } = useTranslation();
  const { data, isLoading } = useGuestScore(phone);

  if (isLoading || !data) return null;

  if (data.totalRatings === 0) {
    if (inline) return null;
    return (
      <p className="text-xs text-tertiary-400">
        {t('history.guest_score_no_ratings')}
      </p>
    );
  }

  if (data.averageRating === null) return null;

  if (inline) {
    return (
      <span className="ml-2 flex items-center gap-1">
        <Star size={12} className="fill-primary-400 text-primary-400" />
        <span className="text-xs font-medium text-secondary-600">
          {data.averageRating.toFixed(1)}
        </span>
        <span className="text-xs text-tertiary-400">({data.totalRatings})</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-tertiary-500">
        {t('history.guest_score_label')}
      </span>
      <div className="flex items-center gap-2">
        <StarRating value={Math.round(data.averageRating)} readonly size={14} />
        <span className="text-sm font-medium text-secondary-600">
          {data.averageRating.toFixed(1)}
        </span>
      </div>
      <span className="text-xs text-tertiary-400">
        {t('history.guest_score_based_on', { count: data.totalRatings })}
      </span>
    </div>
  );
}
