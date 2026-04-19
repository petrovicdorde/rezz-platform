import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import type { TableType } from '@rezz/shared';
import { Input } from '@/components/ui/input';
import { DateInput } from '@/components/ui/date-input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateReservation, useAvailableSlots } from '@/hooks/useReservations';

const TABLE_TYPES: TableType[] = [
  'STANDARD',
  'BOOTH',
  'BAR_SEAT',
  'LOW_TABLE',
  'HIGH_TABLE',
  'TERRACE',
  'VIP',
];

const TABLE_TYPE_KEYS: Record<TableType, string> = {
  STANDARD: 'reservation.table_standard',
  BOOTH: 'reservation.table_booth',
  BAR_SEAT: 'reservation.table_bar_seat',
  LOW_TABLE: 'reservation.table_low_table',
  HIGH_TABLE: 'reservation.table_high_table',
  TERRACE: 'reservation.table_terrace',
  VIP: 'reservation.table_vip',
};

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
}

export function ReservationForm({
  onSuccess,
  onCancel,
}: ReservationFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const createReservation = useCreateReservation();
  const today = format(new Date(), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      date: today,
      time: '',
      numberOfGuests: 1,
      tableType: undefined as unknown as TableType,
      specialRequest: '',
    },
  });

  const watchDate = watch('date');
  const watchTableType = watch('tableType');

  const { data: slots } = useAvailableSlots(watchDate, watchTableType);

  function onSubmit(data: ReservationFormValues): void {
    createReservation.mutate(
      {
        ...data,
        specialRequest: data.specialRequest || undefined,
      },
      { onSuccess },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('reservation.first_name_label')}
          </label>
          <Input
            {...register('firstName', {
              required: t('auth.first_name_required'),
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
            {t('reservation.last_name_label')}
          </label>
          <Input
            {...register('lastName', {
              required: t('auth.last_name_required'),
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
          {t('reservation.phone_label')}
        </label>
        <Input
          {...register('phone', {
            required: t('reservation.phone_required'),
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
            {t('reservation.date_label')}
          </label>
          <DateInput
            type="date"
            min={today}
            placeholder={t('common.select_date')}
            {...register('date', {
              required: t('reservation.date_required'),
            })}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('reservation.time_label')}
          </label>
          <DateInput
            type="time"
            placeholder={t('common.select_time')}
            {...register('time', {
              required: t('reservation.time_required'),
            })}
          />
          {errors.time && (
            <p className="mt-1 text-xs text-red-500">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('reservation.guests_label')}
        </label>
        <Input
          type="number"
          min={1}
          {...register('numberOfGuests', {
            required: t('reservation.min_guests'),
            valueAsNumber: true,
            min: { value: 1, message: t('reservation.min_guests') },
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
          {t('reservation.table_type_label')}
        </label>
        <Controller
          control={control}
          name="tableType"
          rules={{ required: t('reservation.table_type_required') }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('reservation.table_type_label')} />
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
        {errors.tableType && (
          <p className="mt-1 text-xs text-red-500">
            {errors.tableType.message}
          </p>
        )}
        {slots && watchDate && watchTableType && (
          <p
            className={`mt-1 text-xs ${
              slots.available > 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {slots.available > 0
              ? t('reservation.available_tables', { count: slots.available })
              : t('reservation.no_available_tables')}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('reservation.special_request_label')}
        </label>
        <Textarea {...register('specialRequest')} rows={2} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={createReservation.isPending}
          className="bg-primary-400 text-white hover:bg-primary-600"
        >
          {createReservation.isPending
            ? t('common.loading')
            : t('reservation.new')}
        </Button>
      </div>
    </form>
  );
}
