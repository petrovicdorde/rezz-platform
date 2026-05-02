import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateReservation,
  useAvailableSlots,
} from "@/hooks/useReservations";
import { useMyVenue } from "@/hooks/useMyVenue";
import { usePublicSettings, useSettingLabel } from "@/hooks/useSettings";
import { TableType } from "@rezz/shared";

interface ReservationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ReservationFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  tableType: TableType;
  specialRequest: string;
  guestAges: (number | null)[];
}

export function ReservationForm({
  onSuccess,
  onCancel,
}: ReservationFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const createReservation = useCreateReservation();
  const { data: tableTypeOptions } = usePublicSettings("TABLE_TYPE");
  const settingLabel = useSettingLabel();
  const { data: myVenue } = useMyVenue();
  const minGuestAge = myVenue?.minGuestAge ?? null;
  const today = format(new Date(), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      date: today,
      time: "",
      numberOfGuests: 1,
      tableType: undefined as unknown as TableType,
      specialRequest: "",
      guestAges: [null],
    },
  });

  const watchDate = watch("date");
  const watchTableType = watch("tableType");
  const numberOfGuests = watch("numberOfGuests");
  const guestAges = watch("guestAges");

  const { data: slots } = useAvailableSlots(watchDate, watchTableType);

  // Keep the guestAges array in sync with the guest count.
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

  function onSubmit(data: ReservationFormValues): void {
    const guestCount = Number(data.numberOfGuests);
    const ages = (data.guestAges ?? [])
      .slice(0, guestCount)
      .map((a) => (a === null || a === undefined ? null : Number(a)));
    if (!ages.every((a): a is number => a != null)) return;

    createReservation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        date: data.date,
        time: data.time,
        numberOfGuests: guestCount,
        tableType: data.tableType,
        specialRequest: data.specialRequest || undefined,
        guestAges: ages.map((a) => Math.floor(a)),
      },
      { onSuccess },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("reservation.first_name_label")}
          </label>
          <Input
            {...register("firstName", {
              required: t("auth.first_name_required"),
            })}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("reservation.last_name_label")}
          </label>
          <Input
            {...register("lastName", {
              required: t("auth.last_name_required"),
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
        <label className="mb-1 block text-sm font-medium">
          {t("reservation.phone_label")}
        </label>
        <Input
          {...register("phone", {
            required: t("reservation.phone_required"),
          })}
          placeholder="+387..."
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("reservation.date_label")}
          </label>
          <Controller
            control={control}
            name="date"
            rules={{ required: t("reservation.date_required") }}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder={t("common.select_date")}
              />
            )}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("reservation.time_label")}
          </label>
          <Controller
            control={control}
            name="time"
            rules={{ required: t("reservation.time_required") }}
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

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("reservation.guests_label")}
        </label>
        <Input
          type="number"
          min={1}
          {...register("numberOfGuests", {
            required: t("reservation.min_guests"),
            valueAsNumber: true,
            min: { value: 1, message: t("reservation.min_guests") },
          })}
        />
        {errors.numberOfGuests && (
          <p className="mt-1 text-xs text-red-500">
            {errors.numberOfGuests.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("reservation.table_type_label")}
        </label>
        <Controller
          control={control}
          name="tableType"
          rules={{ required: t("reservation.table_type_required") }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("reservation.table_type_label")} />
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
        {errors.tableType && (
          <p className="mt-1 text-xs text-red-500">
            {errors.tableType.message}
          </p>
        )}
        {slots && watchDate && watchTableType && (
          <p
            className={`mt-1 text-xs ${
              slots.available > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {slots.available > 0
              ? t("reservation.available_tables", { count: slots.available })
              : t("reservation.no_available_tables")}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {minGuestAge != null
            ? t("booking.guest_ages_label", { min: minGuestAge })
            : t("booking.guest_ages_label_simple")}
        </label>
        <p className="mb-2 text-xs text-tertiary-500">
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
                <label className="mb-1 block text-xs text-tertiary-500">
                  {t("booking.guest_age_n", { n: index + 1 })}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  aria-invalid={belowMin || !!fieldError ? "true" : "false"}
                  className={
                    belowMin || fieldError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : undefined
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
                      t("booking.guest_age_below_min", { min: minGuestAge })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t("reservation.special_request_label")}
        </label>
        <Textarea {...register("specialRequest")} rows={2} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={createReservation.isPending}
          className="bg-primary-400 text-white hover:bg-primary-600"
        >
          {createReservation.isPending
            ? t("common.loading")
            : t("reservation.new")}
        </Button>
      </div>
    </form>
  );
}
