import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import type { TableType } from '@rezz/shared';
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
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateGuestReservation,
  usePublicAvailableSlots,
} from '@/hooks/useReservations';
import { useMyProfile } from '@/hooks/useProfile';
import type { PublicVenue } from '@/lib/types/venue.types';
import type {
  CreateReservationRequest,
  Reservation,
} from '@/lib/types/reservation.types';

interface BookingFormProps {
  venue: PublicVenue;
  onSuccess: (reservation: Reservation) => void;
}

interface BookingFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  tableType: TableType | '';
  specialRequest: string;
}

const TABLE_TYPE_KEYS: Record<TableType, string> = {
  STANDARD: 'venue.table_standard',
  BOOTH: 'venue.table_booth',
  BAR_SEAT: 'venue.table_bar_seat',
  LOW_TABLE: 'venue.table_low_table',
  HIGH_TABLE: 'venue.table_high_table',
  TERRACE: 'venue.table_terrace',
  VIP: 'venue.table_vip',
};

export function BookingForm({
  venue,
  onSuccess,
}: BookingFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const mutation = useCreateGuestReservation(venue.id);
  const today = format(new Date(), 'yyyy-MM-dd');

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
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      date: '',
      time: '',
      numberOfGuests: 2,
      tableType: '',
      specialRequest: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    const current = getValues();
    if (!current.firstName && profile.firstName) {
      setValue('firstName', profile.firstName);
    }
    if (!current.lastName && profile.lastName) {
      setValue('lastName', profile.lastName);
    }
    if (!current.phone && profile.phone) {
      setValue('phone', profile.phone);
    }
  }, [profile, getValues, setValue]);

  const selectedDate = watch('date');
  const selectedTableType = watch('tableType');

  const { data: slots, isLoading: slotsLoading } = usePublicAvailableSlots(
    venue.id,
    selectedDate,
    selectedTableType,
  );

  const availableTableTypes = Array.from(
    new Set(venue.tables.map((tbl) => tbl.type)),
  );
  const hasTables = availableTableTypes.length > 0;

  function onSubmit(data: BookingFormValues): void {
    if (!data.tableType) return;

    const payload: CreateReservationRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      date: data.date,
      time: data.time,
      numberOfGuests: Number(data.numberOfGuests),
      tableType: data.tableType,
      specialRequest: data.specialRequest || undefined,
    };

    mutation.mutate(payload, {
      onSuccess: (reservation) => onSuccess(reservation),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('booking.first_name_label')}
          </label>
          <Input
            {...register('firstName', { required: t('booking.required') })}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('booking.last_name_label')}
          </label>
          <Input
            {...register('lastName', { required: t('booking.required') })}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary-600">
          {t('booking.phone_label')}
        </label>
        <Input
          type="tel"
          {...register('phone', { required: t('booking.required') })}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('booking.date_label')}
          </label>
          <input
            type="date"
            min={today}
            {...register('date', { required: t('booking.required') })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('booking.time_label')}
          </label>
          <input
            type="time"
            {...register('time', {
              required: t('booking.required'),
              pattern: {
                value: /^([01]\d|2[0-3]):([0-5]\d)$/,
                message: t('booking.invalid_time'),
              },
            })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          {errors.time && (
            <p className="mt-1 text-xs text-red-500">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-secondary-600">
            {t('booking.guests_label')}
          </label>
          <Input
            type="number"
            min={1}
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
          <label className="mb-1 block text-sm font-medium text-secondary-600">
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
                      placeholder={t('booking.table_type_placeholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTableTypes.map((tt) => (
                      <SelectItem key={tt} value={tt}>
                        {t(TABLE_TYPE_KEYS[tt])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <p className="rounded-md border border-tertiary-200 bg-tertiary-50 px-3 py-2 text-sm text-tertiary-500">
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
            <span className="text-tertiary-500">
              {t('booking.availability_checking')}
            </span>
          ) : slots && slots.available > 0 ? (
            <span className="text-primary-600">
              {t('booking.availability_available', { count: slots.available })}
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

      <div>
        <label className="mb-1 block text-sm font-medium text-secondary-600">
          {t('booking.special_request_label')}
        </label>
        <Textarea
          {...register('specialRequest')}
          placeholder={t('booking.special_request_placeholder')}
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending || !hasTables}
        className="w-full bg-primary-400 py-3 font-medium text-white hover:bg-primary-600"
      >
        {mutation.isPending ? t('booking.submitting') : t('booking.submit')}
      </Button>
    </form>
  );
}
