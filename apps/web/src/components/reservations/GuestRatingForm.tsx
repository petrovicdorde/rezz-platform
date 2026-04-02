import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/StarRating';
import { useRateGuest, useUpdateRating } from '@/hooks/useReservations';
import type { GuestRating } from '@/lib/types/reservation.types';

interface GuestRatingFormProps {
  reservationId: string;
  existingRating?: GuestRating | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface RatingFormValues {
  rating: number;
  note: string;
}

export function GuestRatingForm({
  reservationId,
  existingRating,
  onSuccess,
  onCancel,
}: GuestRatingFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const rateGuest = useRateGuest();
  const updateRating = useUpdateRating();
  const isEdit = !!existingRating;
  const mutation = isEdit ? updateRating : rateGuest;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RatingFormValues>({
    defaultValues: {
      rating: existingRating?.rating ?? 0,
      note: existingRating?.note ?? '',
    },
  });

  function onSubmit(data: RatingFormValues): void {
    mutation.mutate(
      {
        reservationId,
        data: { rating: data.rating, note: data.note || undefined },
      },
      { onSuccess },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('history.rating_label')}
        </label>
        <Controller
          control={control}
          name="rating"
          rules={{ min: { value: 1, message: t('history.rating_label') } }}
          render={({ field }) => (
            <StarRating value={field.value} onChange={field.onChange} size={32} />
          )}
        />
        {errors.rating && (
          <p className="mt-1 text-xs text-red-500">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {t('history.rating_note_label')}
        </label>
        <Textarea
          {...register('note')}
          placeholder={t('history.rating_note_placeholder')}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-primary-400 text-white hover:bg-primary-600"
        >
          {mutation.isPending ? t('common.loading') : t('history.rating_save')}
        </Button>
      </div>
    </form>
  );
}
