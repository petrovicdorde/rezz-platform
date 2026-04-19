import { useMemo, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Slot interval in minutes. Default 30. */
  intervalMinutes?: number;
  /** Slot grid lower bound, "HH:MM". Default "08:00". */
  startTime?: string;
  /** Slot grid upper bound (exclusive), "HH:MM". Default "24:00". */
  endTime?: string;
  /** Slots to display as disabled (taken / out-of-hours), "HH:MM". */
  disabledSlots?: string[];
  className?: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${pad(h)}:${pad(m)}`;
}

export function TimePicker({
  value,
  onChange,
  placeholder,
  disabled,
  intervalMinutes = 30,
  startTime = '08:00',
  endTime = '24:00',
  disabledSlots,
  className,
}: TimePickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  const slots = useMemo(() => {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    const out: string[] = [];
    for (let t = start; t < end; t += intervalMinutes) {
      out.push(fromMinutes(t));
    }
    return out;
  }, [startTime, endTime, intervalMinutes]);

  const disabledSet = useMemo(
    () => new Set(disabledSlots ?? []),
    [disabledSlots],
  );

  function handleSelect(slot: string): void {
    onChange(slot);
    setOpen(false);
  }

  const display = value ?? '';
  const showPlaceholder = !display;

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

      <PopoverContent className="w-64 max-h-72 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => {
            const slotDisabled = disabledSet.has(slot);
            const selected = value === slot;
            return (
              <button
                key={slot}
                type="button"
                disabled={slotDisabled}
                onClick={() => handleSelect(slot)}
                className={cn(
                  'flex h-9 cursor-pointer items-center justify-center rounded-lg border text-sm transition-colors',
                  selected &&
                    'border-primary-400 bg-primary-400 font-medium text-white',
                  !selected &&
                    !slotDisabled &&
                    'border-tertiary-200 text-secondary-600 hover:border-primary-200 hover:bg-tertiary-50',
                  slotDisabled &&
                    'cursor-not-allowed border-tertiary-100 bg-tertiary-50 text-tertiary-400 line-through',
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
