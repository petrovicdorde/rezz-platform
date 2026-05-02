import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { usePublicSettings, useSettingLabel } from '@/hooks/useSettings';
import type { SearchFilters } from '@/lib/api/landing.api';

const ALL_SENTINEL = '__ALL__';

interface SearchFilterWidgetProps {
  onSearch: (filters: SearchFilters) => void;
  initialValues?: SearchFilters;
}

const FIELD_WRAPPER =
  'group rounded-2xl border border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 py-2.5 transition-all hover:border-[rgba(249,133,19,0.35)] hover:bg-white hover:shadow-[0_2px_12px_rgba(249,133,19,0.08)] focus-within:border-[rgba(249,133,19,0.55)] focus-within:bg-white has-[[data-state=open]]:border-[rgba(249,133,19,0.55)] has-[[data-state=open]]:bg-white has-[[data-state=open]]:shadow-[0_2px_12px_rgba(249,133,19,0.12)]';

const FIELD_WRAPPER_DISABLED =
  'group rounded-2xl border border-[rgba(20,11,0,0.06)] bg-[#F5F1EB] px-4 py-2.5 opacity-95';

const FIELD_LABEL =
  'block text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[rgba(20,11,0,0.45)] text-center';

const PICKER_RESET =
  '!h-auto !min-h-0 !rounded-none !border-0 !bg-transparent !px-0 !py-0 !shadow-none !text-center';

const DROPDOWN_CONTENT =
  '!rounded-2xl !border-[rgba(20,11,0,0.06)] !bg-[rgba(253,249,244,0.98)] !p-1.5 !text-[#140B00] !shadow-[0_4px_6px_rgba(20,11,0,0.05),0_12px_32px_rgba(20,11,0,0.12),0_24px_48px_rgba(20,11,0,0.14)] backdrop-blur-md';

const DROPDOWN_ITEM =
  '!rounded-xl !px-3 !py-2.5 !text-[0.92rem] !font-medium !text-[#140B00] hover:!bg-[rgba(249,133,19,0.1)] focus:!bg-[rgba(249,133,19,0.12)] data-[state=checked]:!bg-secondary-400 data-[state=checked]:!text-white [&_svg]:!text-current';

export function SearchFilterWidget({
  onSearch,
  initialValues,
}: SearchFilterWidgetProps): React.JSX.Element {
  const { t } = useTranslation();
  const settingLabel = useSettingLabel();
  // const [activeTab, setActiveTab] = useState<'venues' | 'events'>('venues');
  const [type, setType] = useState(initialValues?.type ?? '');
  const [city, setCity] = useState(initialValues?.city ?? '');
  const [date, setDate] = useState(initialValues?.date ?? '');
  const [time, setTime] = useState(initialValues?.time ?? '');

  const { data: cities } = usePublicSettings('CITY');
  const { data: venueTypes } = usePublicSettings('VENUE_TYPE');

  const onlyCity = cities?.length === 1 ? cities[0] : null;
  const cityLocked = onlyCity !== null;

  // When the platform has a single city, lock the field to that city.
  useEffect(() => {
    if (onlyCity && city !== onlyCity.label) {
      setCity(onlyCity.label);
    }
  }, [onlyCity, city]);

  return (
    <div
      className="mx-auto w-full max-w-[640px] rounded-[26px] border border-white/90 bg-[rgba(253,249,244,0.97)] p-5 shadow-[0_0_0_1px_rgba(20,11,0,0.04),0_4px_6px_rgba(20,11,0,0.04),0_12px_32px_rgba(20,11,0,0.12),0_32px_64px_rgba(20,11,0,0.18),0_64px_80px_rgba(20,11,0,0.12)] backdrop-blur-md sm:p-7"
      style={{ WebkitBackdropFilter: 'blur(20px)' }}
    >
      {/* Tabs — Lokali / Događaji. Commented out until events search is wired up.
      <div className="mb-5 flex gap-1 rounded-[13px] bg-[rgba(20,11,0,0.055)] p-1">
        <button
          type="button"
          onClick={() => setActiveTab('venues')}
          className={`flex-1 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'venues'
              ? 'bg-secondary-400 text-white shadow-[0_2px_8px_rgba(249,133,19,0.3),0_6px_20px_rgba(249,133,19,0.2)]'
              : 'text-[rgba(20,11,0,0.45)] hover:text-[#140B00]'
          }`}
        >
          {t('home.search_tab_venues')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`flex-1 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'events'
              ? 'bg-secondary-400 text-white shadow-[0_2px_8px_rgba(249,133,19,0.3),0_6px_20px_rgba(249,133,19,0.2)]'
              : 'text-[rgba(20,11,0,0.45)] hover:text-[#140B00]'
          }`}
        >
          {t('home.search_tab_events')}
        </button>
      </div>
      */}

      {/* Fields */}
      <div className="flex flex-col gap-2.5">
        {/* Location — full width */}
        {cityLocked && onlyCity ? (
          <div
            className={FIELD_WRAPPER_DISABLED}
            aria-disabled="true"
            title={t('home.filter_city_locked_hint')}
          >
            <span className={FIELD_LABEL}>
              {t('home.filter_city_label_short')}
            </span>
            <div className="mt-0.5 text-center text-[0.92rem] font-medium text-[#140B00]">
              {settingLabel(onlyCity)}
            </div>
          </div>
        ) : (
          <div className={FIELD_WRAPPER}>
            <span className={FIELD_LABEL}>
              {t('home.filter_city_label_short')}
            </span>
            <Select
              value={city === '' ? ALL_SENTINEL : city}
              onValueChange={(v) => setCity(v === ALL_SENTINEL ? '' : v)}
            >
              <SelectTrigger
                className={`${PICKER_RESET} mt-0.5 [&>svg]:hidden [&>span]:mx-auto [&>span]:text-[0.92rem] [&>span]:font-medium [&>span]:text-[#140B00] [&>span[data-placeholder]]:text-[rgba(20,11,0,0.5)]`}
              >
                {city === '' ? (
                  <span className="mx-auto text-[0.92rem] font-medium text-[rgba(20,11,0,0.5)]">
                    {t('home.filter_city_placeholder_full')}
                  </span>
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={8}
                data-hero-dropdown="true"
                className={DROPDOWN_CONTENT}
              >
                <SelectItem value={ALL_SENTINEL} className={DROPDOWN_ITEM}>
                  {t('home.filter_city_placeholder')}
                </SelectItem>
                {cities?.map((c) => (
                  <SelectItem
                    key={c.value}
                    value={c.label}
                    className={DROPDOWN_ITEM}
                  >
                    {settingLabel(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Type / Date / Time row */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {/* Type */}
          <div className={FIELD_WRAPPER}>
            <span className={FIELD_LABEL}>
              {t('home.filter_type_label')}
            </span>
            <Select
              value={type === '' ? ALL_SENTINEL : type}
              onValueChange={(v) => setType(v === ALL_SENTINEL ? '' : v)}
            >
              <SelectTrigger
                className={`${PICKER_RESET} mt-0.5 [&>svg]:hidden [&>span]:mx-auto [&>span]:text-[0.92rem] [&>span]:font-medium [&>span]:text-[#140B00] [&>span[data-placeholder]]:text-[rgba(20,11,0,0.5)]`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={8}
                data-hero-dropdown="true"
                className={DROPDOWN_CONTENT}
              >
                <SelectItem value={ALL_SENTINEL} className={DROPDOWN_ITEM}>
                  {t('home.filter_type_placeholder')}
                </SelectItem>
                {venueTypes?.map((vt) => (
                  <SelectItem
                    key={vt.value}
                    value={vt.value}
                    className={DROPDOWN_ITEM}
                  >
                    {settingLabel(vt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className={FIELD_WRAPPER}>
            <span className={FIELD_LABEL}>{t('home.filter_date_label')}</span>
            <div className="mt-0.5 flex justify-center [&>button]:!h-auto [&>button]:!min-h-0 [&>button]:!justify-center [&>button]:!rounded-none [&>button]:!border-0 [&>button]:!bg-transparent [&>button]:!px-0 [&>button]:!py-0 [&>button]:!shadow-none [&>button>span]:!text-[0.92rem] [&>button>span]:!font-medium [&>button>span]:!text-[#140B00]">
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder={t('common.select_date')}
              />
            </div>
          </div>

          {/* Time */}
          <div className={`${FIELD_WRAPPER} col-span-2 sm:col-span-1`}>
            <span className={FIELD_LABEL}>{t('home.filter_time_label')}</span>
            <div className="mt-0.5 flex justify-center [&>button]:!h-auto [&>button]:!min-h-0 [&>button]:!justify-center [&>button]:!rounded-none [&>button]:!border-0 [&>button]:!bg-transparent [&>button]:!px-0 [&>button]:!py-0 [&>button]:!shadow-none [&>button>span]:!text-[0.92rem] [&>button>span]:!font-medium [&>button>span]:!text-[#140B00]">
              <TimePicker
                value={time}
                onChange={setTime}
                placeholder={t('home.filter_time_placeholder')}
              />
            </div>
          </div>
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={() => onSearch({ type, city, date, time })}
          className="group relative mt-1.5 w-full overflow-hidden rounded-[15px] bg-gradient-to-br from-secondary-400 to-secondary-600 px-4 py-4 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,133,19,0.4),0_16px_40px_rgba(249,133,19,0.2)]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[550ms] group-hover:translate-x-full"
          />
          <span className="relative">{t('home.search_button')}</span>
        </button>
      </div>
    </div>
  );
}
