import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  isAfter,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { ClosedDay } from '@/lib/types/venue.types';

interface ClosedDaysPickerProps {
  value: ClosedDay[];
  onChange: (next: ClosedDay[]) => void;
  disabled?: boolean;
}

function key(month: number, day: number): string {
  return `${month}-${day}`;
}

export function ClosedDaysPicker({
  value,
  onChange,
  disabled,
}: ClosedDaysPickerProps): React.JSX.Element {
  const { t } = useTranslation();
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(new Date()));

  const selected = useMemo(() => {
    const set = new Set<string>();
    for (const d of value) set.add(key(d.month, d.day));
    return set;
  }, [value]);

  const monthLabel = `${t(`common.months.${viewMonth.getMonth() + 1}`)} ${viewMonth.getFullYear()}`;

  const weeks = useMemo(() => {
    const firstDay = startOfMonth(viewMonth);
    const lastDay = endOfMonth(viewMonth);
    const gridStart = startOfWeek(firstDay, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(lastDay, { weekStartsOn: 1 });

    const days: Date[] = [];
    let cursor = gridStart;
    while (!isAfter(cursor, gridEnd)) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [viewMonth]);

  function toggle(day: Date): void {
    if (disabled) return;
    if (!isSameMonth(day, viewMonth)) return;
    const m = day.getMonth() + 1;
    const d = day.getDate();
    const k = key(m, d);
    if (selected.has(k)) {
      onChange(value.filter((x) => !(x.month === m && x.day === d)));
    } else {
      onChange([...value, { month: m, day: d }]);
    }
  }

  return (
    <div className="rounded-lg border border-tertiary-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          disabled={disabled}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-tertiary-600 transition-colors hover:bg-tertiary-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-secondary-600">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          disabled={disabled}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-tertiary-600 transition-colors hover:bg-tertiary-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-medium text-tertiary-500">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <div key={d} className="py-1">
            {t(`common.weekdays_short.${d}`)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const m = day.getMonth() + 1;
          const d = day.getDate();
          const isSelected = inMonth && selected.has(key(m, d));
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => toggle(day)}
              disabled={disabled || !inMonth}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors',
                !disabled && inMonth && 'cursor-pointer',
                !inMonth && 'text-tertiary-300',
                inMonth && !isSelected && 'text-secondary-600 hover:bg-tertiary-100',
                isSelected && 'bg-red-500 font-medium text-white hover:bg-red-600',
                disabled && 'cursor-not-allowed',
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
