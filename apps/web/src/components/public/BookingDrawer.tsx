import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, X } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateGuestReservation,
  usePublicAvailableSlots,
} from '@/hooks/useReservations';
import { useMyProfile } from '@/hooks/useProfile';
import { useSettingValueLabel } from '@/hooks/useSettings';
import type { PublicVenue } from '@/lib/types/venue.types';
import type {
  CreateReservationRequest,
  Reservation,
} from '@/lib/types/reservation.types';

interface BookingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: PublicVenue;
  onSuccess: (reservation: Reservation) => void;
  eventId?: string;
  lockedDate?: string;
}

interface BookingFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  tableType: string;
  specialRequest: string;
  guestAges: (number | null)[];
}

const FIELD_INPUT =
  'h-11 rounded-xl border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 text-[#140B00] shadow-none transition-all placeholder:text-[rgba(20,11,0,0.42)] hover:bg-white hover:border-[rgba(249,133,19,0.35)] focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]';

const FIELD_TEXTAREA =
  'rounded-xl border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 py-3 text-[#140B00] shadow-none transition-all placeholder:text-[rgba(20,11,0,0.42)] hover:bg-white hover:border-[rgba(249,133,19,0.35)] focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]';

const ORANGE_CTA =
  'group relative w-full overflow-hidden rounded-xl bg-linear-to-br from-secondary-400 to-secondary-500 px-4 py-3.5 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,133,19,0.4),0_16px_40px_rgba(249,133,19,0.2)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0';

const LABEL = 'mb-1.5 block text-sm font-medium text-[#140B00]';

type Step = 0 | 1 | 2 | 3 | 4;

const STEP_FIELDS: Record<Step, (keyof BookingFormValues)[]> = {
  0: ['firstName', 'lastName', 'phone'],
  1: ['date', 'time', 'numberOfGuests', 'tableType'],
  2: ['guestAges'],
  3: [],
  4: [],
};

export function BookingDrawer({
  open,
  onOpenChange,
  venue,
  onSuccess,
  eventId,
  lockedDate,
}: BookingDrawerProps): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const mutation = useCreateGuestReservation(venue.id);
  const tableTypeLabel = useSettingValueLabel('TABLE_TYPE');

  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      date: lockedDate ?? '',
      time: '',
      numberOfGuests: 2,
      tableType: '',
      specialRequest: '',
      guestAges: [null, null],
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedDate = watch('date');
  const selectedTableType = watch('tableType');
  const numberOfGuests = watch('numberOfGuests');
  const guestAges = watch('guestAges');

  const { data: slots, isLoading: slotsLoading } = usePublicAvailableSlots(
    venue.id,
    selectedDate,
    selectedTableType,
  );

  const availableTableTypes = Array.from(
    new Set(venue.tables.map((tbl) => tbl.type)),
  );
  const hasTables = availableTableTypes.length > 0;
  const minGuestAge = venue.minGuestAge;

  const isClosedDay = (() => {
    if (!selectedDate) return false;
    const parsed = new Date(selectedDate);
    if (Number.isNaN(parsed.getTime())) return false;
    const m = parsed.getMonth() + 1;
    const d = parsed.getDate();
    return (venue.closedDays ?? []).some(
      (cd) => cd.month === m && cd.day === d,
    );
  })();

  // Reset to step 0 every time the drawer is reopened.
  useEffect(() => {
    if (open) {
      setStep(0);
      setDirection('forward');
    }
  }, [open]);

  // Hydrate from profile on first load.
  useEffect(() => {
    if (!profile) return;
    const current = getValues();
    if (!current.firstName && profile.firstName)
      setValue('firstName', profile.firstName);
    if (!current.lastName && profile.lastName)
      setValue('lastName', profile.lastName);
    if (!current.phone && profile.phone) setValue('phone', profile.phone);
  }, [profile, getValues, setValue]);

  // Keep guest-ages array in sync with guest count.
  useEffect(() => {
    const desired = Math.max(1, Number(numberOfGuests) || 0);
    const current = guestAges ?? [];
    if (current.length === desired) return;
    const next: (number | null)[] = Array.from({ length: desired }, (_, i) =>
      current[i] ?? null,
    );
    setValue('guestAges', next, { shouldDirty: false, shouldValidate: false });
  }, [numberOfGuests, guestAges, setValue]);

  async function goNext(): Promise<void> {
    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (!valid) return;
    setDirection('forward');
    setStep((s) => Math.min(4, s + 1) as Step);
  }

  function goBack(): void {
    setDirection('back');
    setStep((s) => Math.max(0, s - 1) as Step);
  }

  function onSubmit(data: BookingFormValues): void {
    if (!data.tableType) return;
    const guestCount = Number(data.numberOfGuests);
    const ages = (data.guestAges ?? [])
      .slice(0, guestCount)
      .map((a) => (a === null || a === undefined ? null : Number(a)));
    if (!ages.every((a): a is number => a != null)) return;

    const payload: CreateReservationRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      date: data.date,
      time: data.time,
      numberOfGuests: guestCount,
      tableType: data.tableType,
      specialRequest: data.specialRequest || undefined,
      eventId,
      guestAges: ages.map((a) => Math.floor(a)),
    };

    mutation.mutate(payload, {
      onSuccess: (reservation) => {
        onSuccess(reservation);
        onOpenChange(false);
        reset();
      },
    });
  }

  const previewValues = getValues();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="bg-[rgba(253,249,244,0.98)]">
        {/* Close */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 rounded-md p-1.5 text-[rgba(20,11,0,0.45)] transition-colors hover:bg-[rgba(20,11,0,0.05)] hover:text-[#140B00]"
          aria-label={t('common.close')}
        >
          <X className="size-5" />
        </button>

        <DrawerHeader className="!text-left">
          <DrawerTitle className="font-serif text-2xl font-bold tracking-[-0.4px] text-[#140B00]">
            {step === 4
              ? t('booking.preview_title')
              : t('booking.drawer_title')}
          </DrawerTitle>
          <p className="mt-0.5 text-sm text-[rgba(20,11,0,0.55)]">
            {step === 4
              ? t('booking.preview_subtitle')
              : t('booking.step_indicator', { current: step + 1, total: 4 })}
          </p>

          {/* Step dots */}
          <div className="mt-3 flex items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                aria-hidden
                className={`h-1.5 rounded-full transition-all ${
                  i < step
                    ? 'w-6 bg-secondary-400'
                    : i === step
                      ? 'w-8 bg-secondary-400 shadow-[0_0_0_3px_rgba(249,133,19,0.18)]'
                      : 'w-4 bg-[rgba(20,11,0,0.12)]'
                }`}
              />
            ))}
          </div>
        </DrawerHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div
            key={step}
            className="booking-step"
            data-direction={direction}
          >
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL}>
                      {t('booking.first_name_label')}
                    </label>
                    <Input
                      className={FIELD_INPUT}
                      {...register('firstName', {
                        required: t('booking.required'),
                      })}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={LABEL}>
                      {t('booking.last_name_label')}
                    </label>
                    <Input
                      className={FIELD_INPUT}
                      {...register('lastName', {
                        required: t('booking.required'),
                      })}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className={LABEL}>{t('booking.phone_label')}</label>
                  <Input
                    type="tel"
                    className={FIELD_INPUT}
                    {...register('phone', {
                      required: t('booking.required'),
                    })}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className={LABEL}>{t('booking.date_label')}</label>
                  {lockedDate ? (
                    <>
                      <Input
                        value={lockedDate}
                        readOnly
                        className={`${FIELD_INPUT} cursor-default opacity-80`}
                      />
                      <input
                        type="hidden"
                        {...register('date', { required: true })}
                      />
                    </>
                  ) : (
                    <Controller
                      control={control}
                      name="date"
                      rules={{ required: t('booking.required') }}
                      render={({ field }) => (
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('common.select_date')}
                        />
                      )}
                    />
                  )}
                  {errors.date && !lockedDate && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.date.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className={LABEL}>{t('booking.time_label')}</label>
                  <Controller
                    control={control}
                    name="time"
                    rules={{
                      required: t('booking.required'),
                      pattern: {
                        value: /^([01]\d|2[0-3]):([0-5]\d)$/,
                        message: t('booking.invalid_time'),
                      },
                    }}
                    render={({ field }) => (
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('common.select_time')}
                      />
                    )}
                  />
                  {errors.time && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.time.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>
                      {t('booking.guests_label')}
                    </label>
                    <Input
                      type="number"
                      min={1}
                      className={FIELD_INPUT}
                      {...register('numberOfGuests', {
                        required: t('booking.required'),
                        valueAsNumber: true,
                        min: { value: 1, message: t('booking.min_guests') },
                      })}
                    />
                    {errors.numberOfGuests && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.numberOfGuests.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={LABEL}>
                      {t('booking.table_type_label')}
                    </label>
                    {hasTables ? (
                      <Controller
                        control={control}
                        name="tableType"
                        rules={{ required: t('booking.required') }}
                        render={({ field }) => (
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'booking.table_type_placeholder',
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTableTypes.map((tt) => (
                                <SelectItem key={tt} value={tt}>
                                  {tableTypeLabel(tt)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    ) : (
                      <p className="rounded-xl border border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 py-3 text-sm text-[rgba(20,11,0,0.55)]">
                        {t('booking.no_tables_configured')}
                      </p>
                    )}
                    {errors.tableType && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.tableType.message}
                      </p>
                    )}
                  </div>
                </div>

                {selectedDate && selectedTableType && (
                  <div className="text-sm">
                    {slotsLoading ? (
                      <span className="text-[rgba(20,11,0,0.55)]">
                        {t('booking.availability_checking')}
                      </span>
                    ) : slots && slots.available > 0 ? (
                      <span className="font-medium text-emerald-700">
                        {t('booking.availability_available', {
                          count: slots.available,
                        })}
                      </span>
                    ) : (
                      slots && (
                        <span className="text-red-500">
                          {t('booking.availability_none')}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <label className={LABEL}>
                  {minGuestAge != null
                    ? t('booking.guest_ages_label', { min: minGuestAge })
                    : t('booking.guest_ages_label_simple')}
                </label>
                <p className="mb-3 text-xs text-[rgba(20,11,0,0.55)]">
                  {minGuestAge != null
                    ? t('booking.guest_ages_hint', { min: minGuestAge })
                    : t('booking.guest_ages_hint_simple')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({
                    length: Math.max(1, Number(numberOfGuests) || 0),
                  }).map((_, index) => {
                    const fieldError = errors.guestAges?.[index];
                    const currentValue = guestAges?.[index];
                    const belowMin =
                      minGuestAge != null &&
                      currentValue != null &&
                      Number(currentValue) > 0 &&
                      Number(currentValue) < minGuestAge;
                    return (
                      <div key={index}>
                        <label className="mb-1 block text-xs text-[rgba(20,11,0,0.55)]">
                          {t('booking.guest_age_n', { n: index + 1 })}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={120}
                          aria-invalid={
                            belowMin || !!fieldError ? 'true' : 'false'
                          }
                          className={
                            belowMin || fieldError
                              ? `${FIELD_INPUT} !border-red-500`
                              : FIELD_INPUT
                          }
                          {...register(`guestAges.${index}` as const, {
                            required: t('booking.guest_age_required'),
                            setValueAs: (v) => {
                              if (v === '' || v === null || v === undefined)
                                return null;
                              const n = Number(v);
                              return Number.isFinite(n) ? Math.floor(n) : null;
                            },
                            validate: (value) => {
                              if (value === null || value === undefined) {
                                return t('booking.guest_age_required');
                              }
                              const n = Number(value);
                              if (minGuestAge != null && n < minGuestAge) {
                                return t('booking.guest_age_below_min', {
                                  min: minGuestAge,
                                });
                              }
                              return true;
                            },
                          })}
                        />
                        {(belowMin || fieldError) && (
                          <p className="mt-1 text-xs text-red-500">
                            {fieldError?.message ??
                              t('booking.guest_age_below_min', {
                                min: minGuestAge,
                              })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className={LABEL}>
                  {t('booking.special_request_label')}
                </label>
                <Textarea
                  className={FIELD_TEXTAREA}
                  rows={5}
                  {...register('specialRequest')}
                  placeholder={t('booking.special_request_placeholder')}
                />
              </div>
            )}

            {step === 4 && (
              <PreviewBlock
                values={previewValues}
                tableTypeLabel={tableTypeLabel}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(20,11,0,0.06)] bg-[rgba(253,249,244,0.98)] p-4">
          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[rgba(20,11,0,0.1)] bg-white px-5 text-sm font-semibold text-[#140B00] transition-all hover:border-[rgba(249,133,19,0.35)]"
              >
                <ArrowLeft className="size-4" />
                {t('booking.back')}
              </button>
            )}

            {step < 3 && (
              <button
                type="button"
                onClick={goNext}
                disabled={isClosedDay && step === 1}
                className={ORANGE_CTA}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
                />
                <span className="relative">{t('booking.next')}</span>
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={goNext}
                disabled={isClosedDay}
                className={ORANGE_CTA}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
                />
                <span className="relative">
                  {isClosedDay
                    ? t('booking.closed_day')
                    : t('booking.reserve_cta')}
                </span>
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={mutation.isPending || !hasTables || isClosedDay}
                className={ORANGE_CTA}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
                />
                <span className="relative">
                  {mutation.isPending
                    ? t('booking.submitting')
                    : t('booking.submit')}
                </span>
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface PreviewBlockProps {
  values: BookingFormValues;
  tableTypeLabel: (value: string) => string;
}

function PreviewBlock({
  values,
  tableTypeLabel,
}: PreviewBlockProps): React.JSX.Element {
  const { t } = useTranslation();
  const guestCount = Number(values.numberOfGuests) || 0;
  const ages = (values.guestAges ?? [])
    .slice(0, guestCount)
    .filter((a): a is number => typeof a === 'number');

  return (
    <div className="rounded-2xl border border-[rgba(20,11,0,0.06)] bg-white/60 backdrop-blur-sm">
      <PreviewRow
        label={t('booking.first_name_label')}
        value={values.firstName}
      />
      <PreviewRow
        label={t('booking.last_name_label')}
        value={values.lastName}
      />
      <PreviewRow label={t('booking.phone_label')} value={values.phone} />
      <PreviewRow label={t('booking.date_label')} value={values.date} />
      <PreviewRow label={t('booking.time_label')} value={values.time} />
      <PreviewRow
        label={t('booking.guests_label')}
        value={String(guestCount)}
      />
      <PreviewRow
        label={t('booking.table_type_label')}
        value={values.tableType ? tableTypeLabel(values.tableType) : '—'}
      />
      <PreviewRow
        label={t('booking.guest_ages_label_simple')}
        value={ages.length > 0 ? ages.join(', ') : '—'}
      />
      {values.specialRequest && (
        <PreviewRow
          label={t('booking.special_request_label')}
          value={values.specialRequest}
        />
      )}
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[rgba(20,11,0,0.05)] px-4 py-3 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-[1px] text-[rgba(20,11,0,0.45)]">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-[#140B00]">
        {value || '—'}
      </span>
    </div>
  );
}
