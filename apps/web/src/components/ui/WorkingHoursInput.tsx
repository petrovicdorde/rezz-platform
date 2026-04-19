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
            className={`flex items-center justify-between gap-4 border-b border-tertiary-200 py-2 last:border-0 ${disabled ? 'opacity-60' : ''}`}
          >
            <span className="text-sm font-medium text-secondary-600 md:w-28">
              <span className="hidden md:inline">{t(`venue.day_${day}`)}</span>
              <span className="md:hidden">{t(`venue.day_${day}`).charAt(0)}</span>
            </span>

            <div className="flex items-center gap-2">
              <Switch
                checked={!dayValue.isClosed}
                onCheckedChange={(checked) =>
                  updateDay(day, { isClosed: !checked })
                }
                disabled={disabled}
              />
              {dayValue.isClosed && (
                <span className="text-sm text-tertiary-400">
                  {t('venue.working_hours_closed')}
                </span>
              )}
            </div>

            {!dayValue.isClosed ? (
              <div className="flex items-center gap-2">
                <div className="w-28">
                  <DateInput
                    type="time"
                    value={dayValue.open}
                    onChange={(e) => updateDay(day, { open: e.target.value })}
                    disabled={disabled}
                  />
                </div>
                <span className="text-sm text-tertiary-400">–</span>
                <div className="w-28">
                  <DateInput
                    type="time"
                    value={dayValue.close}
                    onChange={(e) => updateDay(day, { close: e.target.value })}
                    disabled={disabled}
                  />
                </div>
              </div>
            ) : (
              <div className="w-[15.5rem]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
