import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const ISO = 'yyyy-MM-dd';

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  minDate,
  maxDate,
  className,
}: DatePickerProps): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);
  const min = useMemo(() => minDate ?? today, [minDate, today]);
  const max = useMemo(() => maxDate ?? addDays(today, 90), [maxDate, today]);

  const selectedDate = value ? parseISO(value) : null;
  const [viewMonth, setViewMonth] = useState<Date>(
    selectedDate ?? startOfMonth(today),
  );

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

    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [viewMonth]);

  function handleSelect(day: Date): void {
    onChange(format(day, ISO));
    setOpen(false);
  }

  function isDisabled(day: Date): boolean {
    return isBefore(day, min) || isAfter(day, max);
  }

  const display = selectedDate ? format(selectedDate, 'dd.MM.yyyy') : '';
  const showPlaceholder = !display;

  const canGoPrev = !isBefore(
    endOfMonth(subMonths(viewMonth, 1)),
    startOfDay(min),
  );
  const canGoNext = !isAfter(
    startOfMonth(addMonths(viewMonth, 1)),
    startOfDay(max),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-10 w-full cursor-pointer items-center justify-start rounded-md border border-tertiary-400 bg-white px-3 text-left text-sm shadow-xs transition-colors outline-none',
            'hover:border-primary-200 focus-visible:border-primary-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <span
            className={cn(
              showPlaceholder ? 'text-tertiary-600' : 'text-secondary-600',
            )}
          >
            {display || placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            disabled={!canGoPrev}
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
            disabled={!canGoNext}
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
          {weeks.flat().map((day) => {
            const inMonth = isSameMonth(day, viewMonth);
            const isToday = isSameDay(day, today);
            const isSelected =
              selectedDate !== null && isSameDay(day, selectedDate);
            const dayDisabled = isDisabled(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={dayDisabled}
                onClick={() => handleSelect(day)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors',
                  !dayDisabled && 'cursor-pointer',
                  !inMonth && !dayDisabled && 'text-tertiary-400',
                  inMonth && !isSelected && !dayDisabled && 'text-secondary-600',
                  isToday &&
                    !isSelected &&
                    !dayDisabled &&
                    'border border-primary-200 font-medium',
                  isSelected && 'bg-primary-400 font-medium text-white',
                  !isSelected && !dayDisabled && 'hover:bg-tertiary-100',
                  dayDisabled && 'cursor-not-allowed text-tertiary-400',
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
