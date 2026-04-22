import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DateInput } from '@/components/ui/date-input';
import { useCreateEvent, useUpdateEvent } from '@/hooks/useEvents';
import type { VenueEvent } from '@/lib/types/event.types';

interface EventFormProps {
  initialData?: VenueEvent;
  onSuccess: () => void;
  onCancel: () => void;
}

interface EventFormValues {
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  promotions: { name: string; price: number }[];
}

function toDateTimeLocal(dateStr: string): string {
  return format(new Date(dateStr), "yyyy-MM-dd'T'HH:mm");
}

export function EventForm({
  initialData,
  onSuccess,
  onCancel,
}: EventFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const isEdit = !!initialData;
  const mutation = isEdit ? updateEvent : createEvent;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description ?? '',
          startsAt: toDateTimeLocal(initialData.startsAt),
          endsAt: initialData.endsAt
            ? toDateTimeLocal(initialData.endsAt)
            : '',
          promotions: initialData.promotions.map((p) => ({
            name: p.name,
            price: p.price,
          })),
        }
      : {
          name: '',
          description: '',
          startsAt: '',
          endsAt: '',
          promotions: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'promotions',
  });

  function onSubmit(data: EventFormValues): void {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      startsAt: data.startsAt,
      endsAt: data.endsAt || undefined,
      promotions: data.promotions.filter((p) => p.name),
    };

    if (isEdit) {
      updateEvent.mutate(
        { id: initialData.id, data: payload },
        { onSuccess },
      );
    } else {
      createEvent.mutate(payload, { onSuccess });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('events.name_label')}
        </label>
        <Input
          {...register('name', { required: t('events.name_required') })}
          placeholder={t('events.name_placeholder')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('events.description_label')}
        </label>
        <Textarea
          {...register('description')}
          placeholder={t('events.description_placeholder')}
          rows={3}
        />
      </div>

      {/* Date/time */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('events.starts_at_label')}
          </label>
          <DateInput
            type="datetime-local"
            placeholder={t('events.starts_at_placeholder')}
            {...register('startsAt', {
              required: t('events.starts_at_required'),
              validate: (value) =>
                isEdit ||
                new Date(value) > new Date() ||
                t('events.starts_at_past'),
            })}
          />
          {errors.startsAt && (
            <p className="mt-1 text-xs text-red-500">
              {errors.startsAt.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t('events.ends_at_label')}
          </label>
          <DateInput
            type="datetime-local"
            placeholder={t('events.ends_at_placeholder')}
            {...register('endsAt')}
          />
        </div>
      </div>

      {/* Promotions */}
      <div>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-secondary-600">
          {t('events.promotions_section')}
        </h3>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  {...register(`promotions.${index}.name`, {
                    required: t('events.name_required'),
                  })}
                  placeholder={t('events.promotion_name_placeholder')}
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  {...register(`promotions.${index}.price`, {
                    valueAsNumber: true,
                    min: { value: 0, message: t('events.price_min') },
                  })}
                  placeholder="0.00"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-2 text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          className="mt-2 text-sm text-primary-600 hover:text-primary-800"
          onClick={() => append({ name: '', price: 0 })}
        >
          {t('events.add_promotion')}
        </Button>
      </div>

      {/* Submit */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-primary-400 text-white hover:bg-primary-600"
        >
          {mutation.isPending
            ? t('common.loading')
            : isEdit
              ? t('common.save')
              : t('events.add')}
        </Button>
      </div>
    </form>
  );
}
