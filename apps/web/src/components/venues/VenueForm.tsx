import { useTranslation } from "react-i18next";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { X, Plus } from "lucide-react";
import type { VenueType, TableType, PaymentMethod } from "@rezz/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/ui/TagInput";
import { WorkingHoursInput } from "@/components/ui/WorkingHoursInput";
import { useCreateVenue, useUpdateVenue } from "@/hooks/useVenues";
import type { AdminVenue, CreateVenueRequest } from "@/lib/types/venue.types";

interface VenueFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  initialData?: AdminVenue;
  venueId?: string;
  isReadOnly?: boolean;
}

const VENUE_TYPES: VenueType[] = [
  "RESTAURANT",
  "CAFE",
  "CAFFE_BAR",
  "LOUNGE",
  "CLUB",
  "FAST_FOOD",
  "PIZZERIA",
  "ROOFTOP",
  "SPORTS_BAR",
  "WINE_BAR",
  "HOOKAH_LOUNGE",
  "BAKERY",
];

const VENUE_TYPE_KEYS: Record<VenueType, string> = {
  RESTAURANT: "venue.venue_type_restaurant",
  CAFE: "venue.venue_type_cafe",
  CAFFE_BAR: "venue.venue_type_caffe_bar",
  LOUNGE: "venue.venue_type_lounge",
  CLUB: "venue.venue_type_club",
  FAST_FOOD: "venue.venue_type_fast_food",
  PIZZERIA: "venue.venue_type_pizzeria",
  ROOFTOP: "venue.venue_type_rooftop",
  SPORTS_BAR: "venue.venue_type_sports_bar",
  WINE_BAR: "venue.venue_type_wine_bar",
  HOOKAH_LOUNGE: "venue.venue_type_hookah_lounge",
  BAKERY: "venue.venue_type_bakery",
};

const TABLE_TYPES: TableType[] = [
  "STANDARD",
  "BOOTH",
  "BAR_SEAT",
  "LOW_TABLE",
  "HIGH_TABLE",
  "TERRACE",
  "VIP",
];

const TABLE_TYPE_KEYS: Record<TableType, string> = {
  STANDARD: "venue.table_standard",
  BOOTH: "venue.table_booth",
  BAR_SEAT: "venue.table_bar_seat",
  LOW_TABLE: "venue.table_low_table",
  HIGH_TABLE: "venue.table_high_table",
  TERRACE: "venue.table_terrace",
  VIP: "venue.table_vip",
};

const PAYMENT_METHODS: { value: PaymentMethod; key: string }[] = [
  { value: "CASH", key: "venue.payment_cash" },
  { value: "CARD", key: "venue.payment_card" },
  { value: "MOBILE", key: "venue.payment_mobile" },
];

export function VenueForm({
  onSuccess,
  onCancel,
  initialData,
  venueId,
  isReadOnly = false,
}: VenueFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const createVenue = useCreateVenue();
  const updateVenue = useUpdateVenue();
  const isEdit = !!venueId;
  const mutation = isEdit ? updateVenue : createVenue;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateVenueRequest>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          reservationPhone: initialData.reservationPhone,
          reservationEmail: initialData.reservationEmail ?? "",
          hasParking: initialData.hasParking,
          paymentMethods: initialData.paymentMethods,
          tags: initialData.tags,
          workingHours: initialData.workingHours,
          tables: initialData.tables.map((t) => ({
            type: t.type,
            count: t.count,
            note: t.note ?? "",
          })),
          manager: { email: "", phone: "", firstName: "", lastName: "" },
        }
      : {
          name: "",
          type: undefined,
          reservationPhone: "",
          reservationEmail: "",
          hasParking: false,
          paymentMethods: [],
          tags: [],
          workingHours: {},
          tables: [],
          manager: { email: "", phone: "", firstName: "", lastName: "" },
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tables",
  });

  function onSubmit(data: CreateVenueRequest): void {
    const payload = {
      ...data,
      reservationEmail: data.reservationEmail || undefined,
    };

    if (isEdit) {
      const { manager: _manager, ...updatePayload } = payload;
      void _manager;
      updateVenue.mutate({ id: venueId, data: updatePayload }, { onSuccess });
    } else {
      createVenue.mutate(payload, { onSuccess });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      {/* Section 1 — Basic info */}
      <h3 className="mt-0 mb-3 text-sm font-medium uppercase tracking-wide text-secondary-600">
        {t("venue.name_label")}
      </h3>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">
          {t("venue.name_label")}
        </label>
        <Input
          {...register("name", {
            required: t("venue.name_label"),
            minLength: { value: 2, message: t("venue.name_label") },
          })}
          placeholder={t("venue.name_placeholder")}
          disabled={isReadOnly}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">
          {t("venue.type_label")}
        </label>
        <Controller
          control={control}
          name="type"
          rules={{ required: t("venue.type_label") }}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("venue.type_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {VENUE_TYPES.map((vt) => (
                  <SelectItem key={vt} value={vt}>
                    {t(VENUE_TYPE_KEYS[vt])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">
          {t("venue.phone_label")}
        </label>
        <Input
          {...register("reservationPhone", {
            required: t("venue.phone_label"),
          })}
          placeholder={t("venue.phone_placeholder")}
          disabled={isReadOnly}
        />
        {errors.reservationPhone && (
          <p className="mt-1 text-xs text-red-500">
            {errors.reservationPhone.message}
          </p>
        )}
      </div>

      {!(isReadOnly && !initialData?.reservationEmail) && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            {t("venue.email_label")}
          </label>
          <Input
            {...register("reservationEmail", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("auth.email_invalid"),
              },
            })}
            placeholder={t("venue.email_placeholder")}
            disabled={isReadOnly}
          />
          {errors.reservationEmail && (
            <p className="mt-1 text-xs text-red-500">
              {errors.reservationEmail.message}
            </p>
          )}
        </div>
      )}

      {/* Section 2 — Details */}
      <div className="mb-1 mt-6">
        <label className="mb-1 block text-sm font-medium">
          {t("venue.parking_label")}
        </label>
      </div>
      <Controller
        control={control}
        name="hasParking"
        render={({ field }) => (
          <button
            type="button"
            onClick={() => !isReadOnly && field.onChange(!field.value)}
            className={`mb-4 flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 transition-colors ${
              field.value
                ? "border-primary-400 bg-primary-50"
                : "border-secondary-400 bg-secondary-50"
            } ${isReadOnly ? "pointer-events-none opacity-60" : ""}`}
          >
            <span className="text-sm font-semibold text-secondary-900">
              {t("venue.parking_label")}
            </span>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                field.value
                  ? "bg-primary-400 text-white"
                  : "bg-secondary-400 text-white"
              }`}
            >
              {field.value ? "Da" : "Ne"}
            </span>
          </button>
        )}
      />

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">
          {t("venue.payment_methods_label")}
        </label>
        <Controller
          control={control}
          name="paymentMethods"
          rules={{
            validate: (v) => v.length > 0 || t("venue.payment_methods_label"),
          }}
          render={({ field }) => (
            <div
              className={`flex flex-wrap gap-2 ${
                isReadOnly ? "pointer-events-none opacity-60" : ""
              }`}
            >
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
                            (v: PaymentMethod) => v !== pm.value
                          )
                        );
                      } else {
                        field.onChange([...field.value, pm.value]);
                      }
                    }}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? "bg-primary-400 text-white"
                        : "border border-tertiary-400 text-tertiary-600"
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

      {!(isReadOnly && (!initialData?.tags || initialData.tags.length === 0)) && (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            {t("venue.tags_label")}
          </label>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder={t("venue.tags_placeholder")}
                hint={t("venue.tags_hint")}
                disabled={isReadOnly}
              />
            )}
          />
        </div>
      )}

      {/* Section 3 — Working hours */}
      <h3 className="mt-6 mb-3 text-sm font-medium uppercase tracking-wide text-secondary-600">
        {t("venue.working_hours_label")}
      </h3>

      <Controller
        control={control}
        name="workingHours"
        render={({ field }) => (
          <WorkingHoursInput
            value={field.value ?? {}}
            onChange={field.onChange}
            disabled={isReadOnly}
          />
        )}
      />

      {/* Section 4 — Tables */}
      {!(isReadOnly && fields.length === 0) && (
        <h3 className="mt-6 mb-3 text-sm font-medium uppercase tracking-wide text-secondary-600">
          {t("venue.tables_label")}
        </h3>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-tertiary-200 bg-tertiary-50 p-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">
                  {t("venue.table_type_label")}
                </label>
                <Controller
                  control={control}
                  name={`tables.${index}.type`}
                  rules={{ required: t("venue.table_type_label") }}
                  render={({ field: selectField }) => (
                    <Select
                      value={selectField.value}
                      onValueChange={selectField.onChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("venue.type_placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {TABLE_TYPES.map((tt) => (
                          <SelectItem key={tt} value={tt}>
                            {t(TABLE_TYPE_KEYS[tt])}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="w-24">
                <label className="mb-1 block text-sm font-medium">
                  {t("venue.table_count_label")}
                </label>
                <Input
                  type="number"
                  min={1}
                  {...register(`tables.${index}.count`, {
                    required: t("venue.table_count_label"),
                    valueAsNumber: true,
                    min: { value: 1, message: t("venue.table_count_label") },
                  })}
                  disabled={isReadOnly}
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">
                  {t("venue.table_note_label")}
                </label>
                <Input
                  {...register(`tables.${index}.note`)}
                  placeholder={t("venue.table_note_placeholder")}
                  disabled={isReadOnly}
                />
              </div>

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-7 text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {!isReadOnly && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ type: "STANDARD" as TableType, count: 1, note: "" })
            }
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("venue.add_table")}
          </Button>
        )}
      </div>

      {/* Section 5 — Manager (create mode only) */}
      {!initialData && (
        <>
          <h3 className="mt-6 mb-3 text-sm font-medium uppercase tracking-wide text-secondary-600">
            {t("venue.manager_section")}
          </h3>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              {t("venue.manager_email_label")}
            </label>
            <Input
              {...register("manager.email", {
                required: t("venue.manager_email_label"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("auth.email_invalid"),
                },
              })}
              placeholder={t("venue.manager_email_placeholder")}
            />
            {errors.manager?.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.manager.email.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              {t("venue.manager_phone_label")}
            </label>
            <Input
              {...register("manager.phone", {
                required: t("venue.manager_phone_label"),
              })}
              placeholder={t("venue.manager_phone_placeholder")}
            />
            {errors.manager?.phone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.manager.phone.message}
              </p>
            )}
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("venue.manager_first_name_label")}
              </label>
              <Input
                {...register("manager.firstName")}
                placeholder={t("venue.manager_first_name_label")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("venue.manager_last_name_label")}
              </label>
              <Input
                {...register("manager.lastName")}
                placeholder={t("venue.manager_last_name_label")}
              />
            </div>
          </div>
        </>
      )}

      {/* Submit */}
      {!isReadOnly && (
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          )}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary-400 text-white hover:bg-primary-600"
          >
            {mutation.isPending
              ? t("common.loading")
              : isEdit
              ? t("common.save")
              : t("venue.add_new")}
          </Button>
        </div>
      )}
    </form>
  );
}
