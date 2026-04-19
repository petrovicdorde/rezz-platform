import { useTranslation } from 'react-i18next';
import type { WorkingHours } from '@/lib/types/venue.types';

interface WorkingHoursDisplayProps {
  workingHours: WorkingHours;
}

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayKey = (typeof DAY_ORDER)[number];

const WEEKDAY_INDEX: DayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function WorkingHoursDisplay({
  workingHours,
}: WorkingHoursDisplayProps): React.JSX.Element {
  const { t } = useTranslation();
  const today = WEEKDAY_INDEX[new Date().getDay()];

  const hasAnyDay = DAY_ORDER.some((day) => workingHours[day]);

  if (!hasAnyDay) {
    return (
      <p className="text-sm text-tertiary-400">
        {t('venue_detail.working_hours_not_set')}
      </p>
    );
  }

  return (
    <div>
      {DAY_ORDER.map((day) => {
        const entry = workingHours[day];
        const isToday = day === today;

        return (
          <div
            key={day}
            className="flex items-center justify-between border-b border-tertiary-100 py-2 last:border-0"
          >
            <div className="flex items-center gap-2">
              {isToday && (
                <span className="inline-block h-2 w-2 rounded-full bg-primary-400" />
              )}
              <span
                className={`text-sm text-secondary-600 ${
                  isToday ? 'font-semibold' : ''
                }`}
              >
                {t(`venue_detail.day_${day}`)}
              </span>
            </div>

            {!entry || entry.isClosed ? (
              <span className="text-sm text-tertiary-400">
                {t('venue_detail.closed')}
              </span>
            ) : (
              <span className="text-sm font-medium text-secondary-600">
                {entry.open} - {entry.close}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
