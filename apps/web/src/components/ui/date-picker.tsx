import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
} from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /**
   * Optional per-day predicate. Return `true` to render a date as disabled
   * (un-clickable, muted) on top of the min/max range check. Use for
   * venue-specific blackout days like closed-day exceptions or weekly off
   * days.
   */
  isDateDisabled?: (date: Date) => boolean;
  className?: string;
}

const ISO = "yyyy-MM-dd";

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  minDate,
  maxDate,
  isDateDisabled,
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
    if (isBefore(day, min) || isAfter(day, max)) return true;
    if (isDateDisabled?.(day)) return true;
    return false;
  }

  const display = selectedDate ? format(selectedDate, "dd.MM.yyyy") : "";
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
          data-state={open ? "open" : "closed"}
          className={cn(
            "flex h-11 w-full cursor-pointer items-center justify-start rounded-xl border border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 text-left text-sm font-medium text-[#140B00] outline-none transition-all",
            "hover:border-[rgba(249,133,19,0.35)] hover:bg-white hover:shadow-[0_2px_12px_rgba(249,133,19,0.08)]",
            "focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]",
            "data-[state=open]:border-[rgba(249,133,19,0.55)] data-[state=open]:bg-white data-[state=open]:shadow-[0_2px_12px_rgba(249,133,19,0.12)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span
            className={cn(
              showPlaceholder
                ? "font-normal text-[rgba(20,11,0,0.42)]"
                : "text-[#140B00]",
            )}
          >
            {display || placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-72 rounded-2xl! border-[rgba(20,11,0,0.06)]! bg-[rgba(253,249,244,0.98)]! shadow-[0_0_0_1px_rgba(20,11,0,0.04),0_8px_16px_rgba(20,11,0,0.08),0_24px_48px_rgba(20,11,0,0.18),0_48px_72px_rgba(20,11,0,0.16)]! backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            disabled={!canGoPrev}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-secondary-400 transition-colors hover:bg-[rgba(249,133,19,0.1)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-secondary-400">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            disabled={!canGoNext}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-secondary-400 transition-colors hover:bg-[rgba(249,133,19,0.1)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-secondary-400">
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
                  "flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all",
                  !dayDisabled && "cursor-pointer",
                  !inMonth && !dayDisabled && "text-tertiary-400",
                  inMonth &&
                    !isSelected &&
                    !dayDisabled &&
                    "text-secondary-400",
                  isToday &&
                    !isSelected &&
                    !dayDisabled &&
                    "border border-secondary-200 font-medium",
                  isSelected &&
                    "bg-secondary-400 font-semibold text-white shadow-[0_2px_8px_rgba(249,133,19,0.35),0_6px_20px_rgba(249,133,19,0.25)]",
                  !isSelected &&
                    !dayDisabled &&
                    "hover:bg-[rgba(249,133,19,0.1)]",
                  dayDisabled && "cursor-not-allowed text-tertiary-400",
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
