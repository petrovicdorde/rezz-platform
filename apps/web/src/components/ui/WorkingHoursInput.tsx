import { useTranslation } from 'react-i18next';
import { DateInput } from '@/components/ui/date-input';
import { Switch } from '@/components/ui/switch';
import type { WorkingHours, WorkingHourDay } from '@/lib/types/venue.types';

interface WorkingHoursInputProps {
  value: WorkingHours;
  onChange: (hours: WorkingHours) => void;
  disabled?: boolean;
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

const DEFAULT_DAY: WorkingHourDay = {
  open: '08:00',
  close: '23:00',
  isClosed: false,
};

export function WorkingHoursInput({
  value,
  onChange,
  disabled = false,
}: WorkingHoursInputProps): React.JSX.Element {
  const { t } = useTranslation();

  function getDay(day: (typeof DAYS)[number]): WorkingHourDay {
    return value[day] ?? DEFAULT_DAY;
  }

  function updateDay(
    day: (typeof DAYS)[number],
    patch: Partial<WorkingHourDay>,
  ): void {
    onChange({
      ...value,
      [day]: { ...getDay(day), ...patch },
    });
  }

  return (
    <div>
      {DAYS.map((day) => {
        const dayValue = getDay(day);
        return (
          <div
            key={day}
            className={`flex h-14 items-center gap-3 border-b border-tertiary-200 last:border-0 ${disabled ? 'opacity-60' : ''}`}
          >
            <span className="w-6 text-sm font-medium text-secondary-600 md:w-28">
              <span className="hidden md:inline">{t(`venue.day_${day}`)}</span>
              <span className="md:hidden">{t(`venue.day_${day}`).charAt(0)}</span>
            </span>

            <div className="flex w-10 justify-center">
              <Switch
                checked={!dayValue.isClosed}
                onCheckedChange={(checked) =>
                  updateDay(day, { isClosed: !checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="ml-auto flex items-center justify-end gap-1.5 md:gap-2">
              {dayValue.isClosed ? (
                <span className="text-sm text-tertiary-400">
                  {t('venue.working_hours_closed')}
                </span>
              ) : (
                <>
                  <div className="w-20 md:w-28">
                    <DateInput
                      type="time"
                      value={dayValue.open}
                      onChange={(e) => updateDay(day, { open: e.target.value })}
                      disabled={disabled}
                      className="[&::-webkit-calendar-picker-indicator]:hidden md:[&::-webkit-calendar-picker-indicator]:inline-block"
                    />
                  </div>
                  <span className="text-sm text-tertiary-400">–</span>
                  <div className="w-20 md:w-28">
                    <DateInput
                      type="time"
                      value={dayValue.close}
                      onChange={(e) => updateDay(day, { close: e.target.value })}
                      disabled={disabled}
                      className="[&::-webkit-calendar-picker-indicator]:hidden md:[&::-webkit-calendar-picker-indicator]:inline-block"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
