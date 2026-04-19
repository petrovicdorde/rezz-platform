import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { usePublicSettings } from '@/hooks/useSettings';
import type { SearchFilters } from '@/lib/api/landing.api';

interface SearchFilterWidgetProps {
  onSearch: (filters: SearchFilters) => void;
  initialValues?: SearchFilters;
}

export function SearchFilterWidget({
  onSearch,
  initialValues,
}: SearchFilterWidgetProps): React.JSX.Element {
  const { t } = useTranslation();
  const [type, setType] = useState(initialValues?.type ?? '');
  const [city, setCity] = useState(initialValues?.city ?? '');
  const [date, setDate] = useState(initialValues?.date ?? '');
  const [time, setTime] = useState(initialValues?.time ?? '');

  const { data: cities } = usePublicSettings('CITY');
  const { data: venueTypes } = usePublicSettings('VENUE_TYPE');

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {/* Venue type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-tertiary-600">
            {t('home.filter_type_label')}
          </label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder={t('home.filter_type_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {venueTypes?.map((vt) => (
                <SelectItem key={vt.value} value={vt.value}>
                  {vt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div>
          <label className="mb-1 block text-xs font-medium text-tertiary-600">
            {t('home.filter_city_label')}
          </label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder={t('home.filter_city_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {cities?.map((c) => (
                <SelectItem key={c.value} value={c.label}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-tertiary-600">
            {t('home.filter_date_label')}
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            placeholder={t('common.select_date')}
          />
        </div>

        {/* Time */}
        <div>
          <label className="mb-1 block text-xs font-medium text-tertiary-600">
            {t('home.filter_time_label')}
          </label>
          <TimePicker
            value={time}
            onChange={setTime}
            placeholder={t('common.select_time')}
          />
        </div>
      </div>

      {/* Search button */}
      <Button
        onClick={() => onSearch({ type, city, date, time })}
        className="mt-4 w-full bg-primary-400 py-3 font-medium text-white hover:bg-primary-600"
      >
        <Search className="mr-2 h-4 w-4" />
        {t('home.filter_search_button')}
      </Button>
    </div>
  );
}
