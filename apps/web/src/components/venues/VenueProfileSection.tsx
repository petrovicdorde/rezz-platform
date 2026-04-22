import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { X, Plus, ImageIcon } from 'lucide-react';
import type { PaymentMethod } from '@rezz/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/ui/TagInput';
import { WorkingHoursInput } from '@/components/ui/WorkingHoursInput';
import { useMyVenue, useUpdateMyVenue } from '@/hooks/useMyVenue';
import { usePublicSettings, useSettingLabel } from '@/hooks/useSettings';
import type { WorkingHours, WorkingHourDay } from '@/lib/types/venue.types';

const PAYMENT_METHODS: { value: PaymentMethod; key: string }[] = [
  { value: 'CASH', key: 'venue.payment_cash' },
  { value: 'CARD', key: 'venue.payment_card' },
  { value: 'MOBILE', key: 'venue.payment_mobile' },
];

const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const DEFAULT_DAY_HOURS: WorkingHourDay = {
  open: '08:00',
  close: '23:00',
  isClosed: false,
};

function fillMissingDays(hours: WorkingHours | undefined): WorkingHours {
  const filled: WorkingHours = { ...(hours ?? {}) };
  for (const day of WEEK_DAYS) {
    if (!filled[day]) filled[day] = { ...DEFAULT_DAY_HOURS };
  }
  return filled;
}

interface FormValues {
  description: string;
  address: string;
  paymentMethods: PaymentMethod[];
  tags: string[];
  workingHours: WorkingHours;
  tables: { type: string; count: number; note: string }[];
  socialLinks: string[];
}

const URL_PATTERN = /^https?:\/\/[^\s]+\.[^\s]+$/i;

export function VenueProfileSection(): React.JSX.Element | null {
  const { t } = useTranslation();
  const { data: venue, isLoading } = useMyVenue();
  const updateVenue = useUpdateMyVenue();
  const { data: tableTypeOptions } = usePublicSettings('TABLE_TYPE');
  const settingLabel = useSettingLabel();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      description: '',
      address: '',
      paymentMethods: [],
      tags: [],
      workingHours: fillMissingDays(undefined),
      tables: [],
      socialLinks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tables',
  });

  useEffect(() => {
    if (!venue) return;
    reset({
      description: venue.description ?? '',
      address: venue.address ?? '',
      paymentMethods: venue.paymentMethods ?? [],
      tags: venue.tags ?? [],
      workingHours: fillMissingDays(venue.workingHours),
      tables: (venue.tables ?? []).map((tbl) => ({
        type: tbl.type,
        count: tbl.count,
        note: tbl.note ?? '',
      })),
      socialLinks: venue.socialLinkUrls ?? [],
    });
  }, [venue, reset]);

  const socialLinks = watch('socialLinks') ?? [];
  const hasInvalidSocialLink = socialLinks.some(
    (url) => !url || !url.trim() || !URL_PATTERN.test(url.trim()),
  );

  function addSocialLink(): void {
    if (socialLinks.length >= 5) return;
    if (hasInvalidSocialLink) return;
    setValue('socialLinks', [...socialLinks, ''], { shouldDirty: true });
  }

  function removeSocialLink(index: number): void {
    setValue(
      'socialLinks',
      socialLinks.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  }

  function onSubmit(data: FormValues): void {
    const cleanedSocialLinks = data.socialLinks
      .map((url) => url.trim())
      .filter((url) => url !== '');
    updateVenue.mutate({
      address: data.address,
      description: data.description.trim() || undefined,
      paymentMethods: data.paymentMethods,
      tags: data.tags,
      workingHours: fillMissingDays(data.workingHours),
      tables: data.tables,
      socialLinks: cleanedSocialLinks,
    });
  }

  if (isLoading) {
    return (
      <div className="mt-6 h-64 animate-pulse rounded-2xl bg-tertiary-100" />
    );
  }

  if (!venue) return null;

  return (
    <section className="mt-6 rounded-2xl border border-tertiary-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-600">
          {t('my_venue.title')}
        </h2>
        <span className="text-sm text-tertiary-500">{venue.name}</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* About */}
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('my_venue.about_label')}
          </label>
          <Textarea
            {...register('description', {
              maxLength: { value: 800, message: t('my_venue.about_max') },
            })}
            placeholder={t('my_venue.about_placeholder')}
            rows={5}
            className="max-h-48 resize-y"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('venue.address_label')}
          </label>
          <Input
            {...register('address', {
              required: t('venue.address_required'),
              minLength: { value: 3, message: t('venue.address_required') },
            })}
            placeholder={t('venue.address_placeholder')}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Working hours */}
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-tertiary-500">
            {t('venue.working_hours_label')}
          </h3>
          <Controller
            control={control}
            name="workingHours"
            render={({ field }) => (
              <WorkingHoursInput
                value={field.value ?? {}}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Payment methods */}
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('venue.payment_methods_label')}
          </label>
          <Controller
            control={control}
            name="paymentMethods"
            rules={{
              validate: (v) =>
                v.length > 0 || t('venue.payment_methods_label'),
            }}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const selected = field.value.includes(pm.value);
                  return (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          field.onChange(
                            field.value.filter(
                              (v: PaymentMethod) => v !== pm.value,
                            ),
                          );
                        } else {
                          field.onChange([...field.value, pm.value]);
                        }
                      }}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-primary-400 text-white'
                          : 'border border-tertiary-400 text-tertiary-600'
                      }`}
                    >
                      {t(pm.key)}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.paymentMethods && (
            <p className="mt-1 text-xs text-red-500">
              {errors.paymentMethods.message}
            </p>
          )}
        </div>

        {/* Tables */}
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-tertiary-500">
            {t('venue.tables_label')}
          </h3>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border border-tertiary-200 bg-tertiary-50 p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start">
                  <div className="flex items-start gap-3 md:contents">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium">
                        {t('venue.table_type_label')}
                      </label>
                      <Controller
                        control={control}
                        name={`tables.${index}.type`}
                        rules={{ required: t('venue.table_type_label') }}
                        render={({ field: selectField }) => (
                          <Select
                            value={selectField.value}
                            onValueChange={selectField.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('venue.type_placeholder')}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {tableTypeOptions?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {settingLabel(opt)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="w-24">
                      <label className="mb-1 block text-sm font-medium">
                        {t('venue.table_count_label')}
                      </label>
                      <Input
                        type="number"
                        min={1}
                        {...register(`tables.${index}.count`, {
                          required: t('venue.table_count_label'),
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: t('venue.table_count_label'),
                          },
                        })}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:contents">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium">
                        {t('venue.table_note_label')}
                      </label>
                      <Input
                        {...register(`tables.${index}.note`)}
                        placeholder={t('venue.table_note_placeholder')}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-7 text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  type: tableTypeOptions?.[0]?.value ?? '',
                  count: 1,
                  note: '',
                })
              }
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('venue.add_table')}
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('venue.tags_label')}
          </label>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder={t('venue.tags_placeholder')}
                hint={t('venue.tags_hint')}
              />
            )}
          />
        </div>

        {/* Social links */}
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-tertiary-500">
            {t('venue.social_links_label')}
          </h3>
          <div className="space-y-2">
            {socialLinks.map((_, index) => {
              const error = errors.socialLinks?.[index];
              return (
                <div key={index}>
                  <div className="flex items-center gap-2">
                    <Input
                      type="url"
                      {...register(`socialLinks.${index}` as const, {
                        required: t('venue.social_link_required'),
                        validate: (val) =>
                          (val && URL_PATTERN.test(val.trim())) ||
                          t('venue.social_link_invalid'),
                      })}
                      placeholder={t('venue.social_links_placeholder')}
                      aria-invalid={error ? 'true' : 'false'}
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {error && (
                    <p className="mt-1 text-xs text-red-500">{error.message}</p>
                  )}
                </div>
              );
            })}
            {socialLinks.length < 5 && (
              <button
                type="button"
                onClick={addSocialLink}
                disabled={hasInvalidSocialLink}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 disabled:cursor-not-allowed disabled:text-tertiary-400"
              >
                <Plus className="h-4 w-4" />
                {t('venue.add_link')}
              </button>
            )}
          </div>
        </div>

        {/* Gallery (placeholder — separate feature) */}
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-tertiary-500">
            {t('my_venue.gallery_label')}
          </h3>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-tertiary-300 bg-tertiary-50 py-8 text-tertiary-400">
            <ImageIcon className="h-8 w-8" />
            <p className="text-sm">{t('my_venue.gallery_coming_soon')}</p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={
              updateVenue.isPending ||
              !isDirty ||
              Object.keys(errors).length > 0
            }
            className="bg-primary-400 text-white hover:bg-primary-600"
          >
            {updateVenue.isPending
              ? t('common.loading')
              : t('common.save')}
          </Button>
        </div>
      </form>
    </section>
  );
}
