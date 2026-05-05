import { useTranslation } from 'react-i18next';
import { addDays } from 'date-fns';
import type { ClosedDay, WorkingHours } from '@/lib/types/venue.types';

interface WorkingHoursDisplayProps {
  workingHours: WorkingHours;
  closedDays?: ClosedDay[];
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayKey = (typeof DAYS)[number];

// JS `Date.getDay()` is Sun=0..Sat=6. Our DAYS array starts on Monday.
function jsDayToMondayIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export function WorkingHoursDisplay({
  workingHours,
  closedDays = [],
}: WorkingHoursDisplayProps): React.JSX.Element {
  const { t } = useTranslation();

  const hasAnyDay = DAYS.some((day) => workingHours[day]);
  if (!hasAnyDay) {
    return (
      <p className="text-sm italic text-[rgba(20,11,0,0.42)]">
        {t('venue_detail.working_hours_not_set')}
      </p>
    );
  }

  // Build a 7-day window starting today.
  const today = new Date();
  const todayIndex = jsDayToMondayIndex(today.getDay());

  const sequence = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const dayKey: DayKey = DAYS[(todayIndex + i) % 7];
    const entry = workingHours[dayKey];
    const isClosedDayException = closedDays.some(
      (cd) => cd.month === date.getMonth() + 1 && cd.day === date.getDate(),
    );
    const closed = isClosedDayException || !entry || entry.isClosed === true;
    return { dayKey, entry, isToday: i === 0, closed };
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(17,17,68,0.08)] bg-white/60 backdrop-blur-sm">
      {sequence.map(({ dayKey, entry, isToday, closed }, index) => (
        <div
          key={`${index}-${dayKey}`}
          className={`relative flex items-center justify-between px-4 py-3 transition-colors sm:px-5 ${
            isToday
              ? 'bg-[rgba(17,17,68,0.04)]'
              : 'hover:bg-[rgba(17,17,68,0.02)]'
          } ${index > 0 ? 'border-t border-[rgba(17,17,68,0.06)]' : ''}`}
        >
          {isToday && (
            <span
              aria-hidden
              className="absolute top-0 bottom-0 left-0 w-0.75 bg-primary-400"
            />
          )}
          <div className="flex items-center gap-2.5">
            {isToday && (
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-primary-400 shadow-[0_0_0_3px_rgba(17,17,68,0.12)]"
              />
            )}
            <span
              className={`text-sm tracking-[0.1px] ${
                isToday
                  ? 'font-semibold text-primary-400'
                  : 'font-medium text-[#140B00]'
              }`}
            >
              {t(`venue_detail.day_${dayKey}`)}
            </span>
          </div>

          {closed || !entry ? (
            <span className="text-sm italic text-[rgba(20,11,0,0.4)]">
              {t('venue_detail.day_off')}
            </span>
          ) : (
            <span
              className={`text-sm font-medium tabular-nums ${
                isToday ? 'text-primary-400' : 'text-[rgba(20,11,0,0.6)]'
              }`}
            >
              {entry.open} — {entry.close}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
