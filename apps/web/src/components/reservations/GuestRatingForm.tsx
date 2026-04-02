import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/StarRating';
import { useRateGuest } from '@/hooks/useReservations';
import i18n from '@/i18n';

interface GuestRatingFormProps {
  reservationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface RatingFormValues {
  rating: number;
  note: string;
}

export function GuestRatingForm({
  reservationId,
  onSuccess,
  onCancel,
}: GuestRatingFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const rateGuest = useRateGuest();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RatingFormValues>({
    defaultValues: { rating: 0, note: '' },
  });

  function onSubmit(data: RatingFormValues): void {
    rateGuest.mutate(
      {
        reservationId,
        data: { rating: data.rating, note: data.note || undefined },
      },
      {
        onSuccess: () => {
          toast.success(i18n.t('history.rating_saved'));
          onSuccess();
        },
      },
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
          disabled={rateGuest.isPending}
          className="bg-primary-400 text-white hover:bg-primary-600"
        >
          {rateGuest.isPending ? t('common.loading') : t('history.rating_save')}
        </Button>
      </div>
    </form>
  );
}
