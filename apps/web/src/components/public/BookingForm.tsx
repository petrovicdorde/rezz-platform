import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";
import { useCreateGuestReservation } from "@/hooks/useReservations";
import { useMyProfile } from "@/hooks/useProfile";
import { useSettingValueLabel } from "@/hooks/useSettings";
import type { PublicVenue } from "@/lib/types/venue.types";
import type {
  CreateReservationRequest,
  Reservation,
} from "@/lib/types/reservation.types";

interface BookingFormProps {
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
  "h-11 rounded-xl border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 text-[#140B00] shadow-none transition-all placeholder:text-[rgba(20,11,0,0.42)] hover:bg-white hover:border-[rgba(249,133,19,0.35)] focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]";

const FIELD_TEXTAREA =
  "rounded-xl border-[rgba(20,11,0,0.07)] bg-[#F5F1EB] px-4 py-3 text-[#140B00] shadow-none transition-all placeholder:text-[rgba(20,11,0,0.42)] hover:bg-white hover:border-[rgba(249,133,19,0.35)] focus-visible:border-[rgba(249,133,19,0.55)] focus-visible:bg-white focus-visible:shadow-[0_2px_12px_rgba(249,133,19,0.12)]";

const ORANGE_CTA =
  "group relative w-full overflow-hidden rounded-xl bg-linear-to-br from-secondary-400 to-secondary-500 px-4 py-3.5 text-base font-bold tracking-[0.3px] text-white shadow-[0_4px_12px_rgba(249,133,19,0.3),0_8px_28px_rgba(249,133,19,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,133,19,0.4),0_16px_40px_rgba(249,133,19,0.2)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0";

// JS Date.getDay() index → WorkingHours key (Sun = 0).
const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function BookingForm({
  venue,
  onSuccess,
  eventId,
  lockedDate,
}: BookingFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const mutation = useCreateGuestReservation(venue.id);
  const tableTypeLabel = useSettingValueLabel("TABLE_TYPE");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BookingFormValues>({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      date: lockedDate ?? "",
      time: "",
      numberOfGuests: 2,
      tableType: "",
      specialRequest: "",
      guestAges: [null, null],
    },
  });

  useEffect(() => {
    if (!profile) return;
    const current = getValues();
    if (!current.firstName && profile.firstName) {
      setValue("firstName", profile.firstName);
    }
    if (!current.lastName && profile.lastName) {
      setValue("lastName", profile.lastName);
    }
    if (!current.phone && profile.phone) {
      setValue("phone", profile.phone);
    }
  }, [profile, getValues, setValue]);

  const selectedDate = watch("date");
  const numberOfGuests = watch("numberOfGuests");
  const guestAges = watch("guestAges");

  const availableTableTypes = Array.from(
    new Set(venue.tables.map((tbl) => tbl.type)),
  );
  const hasTables = availableTableTypes.length > 0;

  const minGuestAge = venue.minGuestAge;

  // Disabled-date predicate for the date picker — combines the venue's
  // year-agnostic closed-day exceptions with weekly working hours so days
  // the venue isn't operating cannot be picked at all.
  const isDateDisabled = (date: Date): boolean => {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    if ((venue.closedDays ?? []).some((cd) => cd.month === m && cd.day === d))
      return true;
    const weekdayKey = WEEKDAYS[date.getDay()];
    const entry = venue.workingHours[weekdayKey];
    return !entry || entry.isClosed === true;
  };

  // Disable submit after a failed attempt; re-enable as soon as the user
  // edits any field, so they don't blindly resubmit the same broken payload.
  const [lockSubmit, setLockSubmit] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const sub = watch(() => setLockSubmit(false));
    return () => sub.unsubscribe();
  }, [watch]);

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

  useEffect(() => {
    const desired = Math.max(1, Number(numberOfGuests) || 0);
    const current = guestAges ?? [];
    if (current.length === desired) return;
    const next: (number | null)[] = Array.from(
      { length: desired },
      (_, i) => current[i] ?? null,
    );
    setValue("guestAges", next, { shouldDirty: false, shouldValidate: false });
  }, [numberOfGuests, guestAges, setValue]);

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
        setLockSubmit(false);
        onSuccess(reservation);
      },
      onError: () => setLockSubmit(true),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
            {t("booking.first_name_label")}
          </label>
          <Input
            className={FIELD_INPUT}
            {...register("firstName", { required: t("booking.required") })}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
            {t("booking.last_name_label")}
          </label>
          <Input
            className={FIELD_INPUT}
            {...register("lastName", { required: t("booking.required") })}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
          {t("booking.phone_label")}
        </label>
        <Input
          type="tel"
          className={FIELD_INPUT}
          {...register("phone", { required: t("booking.required") })}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
            {t("booking.date_label")}
          </label>
          {lockedDate ? (
            <>
              <Input
                value={lockedDate}
                readOnly
                className={`${FIELD_INPUT} cursor-default opacity-80`}
              />
              <input type="hidden" {...register("date", { required: true })} />
              <p className="mt-1 text-xs text-[rgba(20,11,0,0.42)]">
                {t("booking.date_locked_by_event")}
              </p>
            </>
          ) : (
            <Controller
              control={control}
              name="date"
              rules={{ required: t("booking.required") }}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("common.select_date")}
                  isDateDisabled={isDateDisabled}
                />
              )}
            />
          )}
          {errors.date && !lockedDate && (
            <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
            {t("booking.time_label")}
          </label>
          <Controller
            control={control}
            name="time"
            rules={{
              required: t("booking.required"),
              pattern: {
                value: /^([01]\d|2[0-3]):([0-5]\d)$/,
                message: t("booking.invalid_time"),
              },
            }}
            render={({ field }) => (
              <TimePicker
                value={field.value}
                onChange={field.onChange}
                placeholder={t("common.select_time")}
              />
            )}
          />
          {errors.time && (
            <p className="mt-1 text-xs text-red-500">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
            {t("booking.guests_label")}
          </label>
          <Input
            type="number"
            min={1}
            className={FIELD_INPUT}
            {...register("numberOfGuests", {
              required: t("booking.required"),
              valueAsNumber: true,
              min: { value: 1, message: t("booking.min_guests") },
            })}
          />
          {errors.numberOfGuests && (
            <p className="mt-1 text-xs text-red-500">
              {errors.numberOfGuests.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
            {t("booking.table_type_label")}
          </label>
          {hasTables ? (
            <Controller
              control={control}
              name="tableType"
              rules={{ required: t("booking.required") }}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("booking.table_type_placeholder")}
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
              {t("booking.no_tables_configured")}
            </p>
          )}
          {errors.tableType && (
            <p className="mt-1 text-xs text-red-500">
              {errors.tableType.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
          {minGuestAge != null
            ? t("booking.guest_ages_label", { min: minGuestAge })
            : t("booking.guest_ages_label_simple")}
        </label>
        <p className="mb-2 text-xs text-[rgba(20,11,0,0.55)]">
          {minGuestAge != null
            ? t("booking.guest_ages_hint", { min: minGuestAge })
            : t("booking.guest_ages_hint_simple")}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                  {t("booking.guest_age_n", { n: index + 1 })}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  aria-invalid={belowMin || !!fieldError ? "true" : "false"}
                  className={
                    belowMin || fieldError
                      ? `${FIELD_INPUT} border-red-500! focus-visible:border-red-500! focus-visible:shadow-[0_2px_12px_rgba(239,68,68,0.18)]!`
                      : FIELD_INPUT
                  }
                  {...register(`guestAges.${index}` as const, {
                    required: t("booking.guest_age_required"),
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined)
                        return null;
                      const n = Number(v);
                      return Number.isFinite(n) ? Math.floor(n) : null;
                    },
                    validate: (value) => {
                      if (value === null || value === undefined) {
                        return t("booking.guest_age_required");
                      }
                      const n = Number(value);
                      if (minGuestAge != null && n < minGuestAge) {
                        return t("booking.guest_age_below_min", {
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
                      t("booking.guest_age_below_min", {
                        min: minGuestAge,
                      })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#140B00]">
          {t("booking.special_request_label")}
        </label>
        <Textarea
          className={FIELD_TEXTAREA}
          {...register("specialRequest")}
          placeholder={t("booking.special_request_placeholder")}
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending || !hasTables || isClosedDay || lockSubmit}
        className={`${ORANGE_CTA} mt-2`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-550 group-hover:translate-x-full"
        />
        <span className="relative">
          {isClosedDay
            ? t("booking.closed_day")
            : mutation.isPending
              ? t("booking.submitting")
              : t("booking.submit")}
        </span>
      </button>
    </form>
  );
}
