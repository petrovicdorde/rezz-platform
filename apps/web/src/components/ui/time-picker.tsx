import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  return n.toString().padStart(2, "0");
}

function toMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
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
  startTime = "08:00",
  endTime = "24:00",
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

  const display = value ?? "";
  const showPlaceholder = !display;

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

      <PopoverContent className="scrollbar-orange max-h-72 w-64 overflow-y-auto rounded-2xl! border-[rgba(20,11,0,0.06)]! bg-[rgba(253,249,244,0.98)]! shadow-[0_0_0_1px_rgba(20,11,0,0.04),0_8px_16px_rgba(20,11,0,0.08),0_24px_48px_rgba(20,11,0,0.18),0_48px_72px_rgba(20,11,0,0.16)]! backdrop-blur-md">
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
                  "flex h-9 cursor-pointer items-center justify-center rounded-lg border text-sm transition-all",
                  selected &&
                    "border-secondary-400 bg-secondary-400 font-semibold text-white shadow-[0_2px_8px_rgba(249,133,19,0.35),0_6px_20px_rgba(249,133,19,0.25)]",
                  !selected &&
                    !slotDisabled &&
                    "border-tertiary-200 text-secondary-400 hover:border-[rgba(249,133,19,0.4)] hover:bg-[rgba(249,133,19,0.08)]",
                  slotDisabled &&
                    "cursor-not-allowed border-tertiary-100 bg-tertiary-50 text-tertiary-400 line-through",
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
