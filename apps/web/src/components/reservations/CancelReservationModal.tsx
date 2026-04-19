import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCancelReservation } from '@/hooks/useReservations';

interface CancelReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string | null;
  guestName: string;
}

interface CancelFormValues {
  reason: string;
}

export function CancelReservationModal({
  isOpen,
  onClose,
  reservationId,
  guestName,
}: CancelReservationModalProps): React.JSX.Element {
  const { t } = useTranslation();
  const cancelMutation = useCancelReservation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelFormValues>();

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  function onSubmit(data: CancelFormValues): void {
    if (!reservationId) return;
    cancelMutation.mutate(
      { id: reservationId, reason: data.reason },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
      },
    );
  }

  function handleClose(): void {
    onClose();
    reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('reservation.cancel_title')}</DialogTitle>
          <p className="mt-1 text-sm text-tertiary-500">{guestName}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <p className="text-sm font-medium text-secondary-600">
            {t('reservation.cancel_confirm_question')}
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('reservation.cancel_reason_label')}
            </label>
            <textarea
              rows={4}
              placeholder={t('reservation.cancel_reason_placeholder')}
              className="w-full rounded-lg border border-input p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400"
              {...register('reason', {
                required: t('reservation.cancel_reason_required'),
                minLength: {
                  value: 5,
                  message: t('reservation.cancel_reason_required'),
                },
              })}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-500">
                {errors.reason.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={cancelMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {cancelMutation.isPending
                ? t('common.loading')
                : t('reservation.cancel_confirm')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
