import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReservationStatusBadge } from './ReservationStatusBadge';
import { useConfirmReservation, useRejectReservation } from '@/hooks/useReservations';
import { useMarkAsRead } from '@/hooks/useNotifications';
import type { Notification } from '@/lib/types/notification.types';
import type { ReservationStatus } from '@rezz/shared';

interface ReservationDetailDrawerProps {
  notification: Notification | null;
  onClose: () => void;
  onActionComplete: () => void;
}

export function ReservationDetailDrawer({
  notification,
  onClose,
  onActionComplete,
}: ReservationDetailDrawerProps): React.JSX.Element {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'reject' | null>(null);
  const confirmMutation = useConfirmReservation();
  const rejectMutation = useRejectReservation();
  const markAsReadMutation = useMarkAsRead();

  const res = notification?.reservation;
  const status = res?.status as ReservationStatus | undefined;

  useEffect(() => {
    setNote('');
    setConfirmAction(null);
  }, [notification?.id]);

  return (
    <Sheet open={notification !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm p-0">
        <SheetTitle className="sr-only">{t('notifications.reservation_details')}</SheetTitle>
        <div className="flex h-full flex-col overflow-y-auto p-4">
          {/* Header */}
          <h2 className="text-lg font-medium text-secondary-600">
            {t('notifications.reservation_details')}
          </h2>
          {status && (
            <div className="mt-2">
              <ReservationStatusBadge status={status} />
            </div>
          )}

          {res && (
            <>
              <Separator className="my-4" />

              {/* Info rows */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-tertiary-500">{t('reservation.first_name_label')}</span>
                  <span className="font-medium text-secondary-600">
                    {res.firstName} {res.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-tertiary-500">{t('reservation.phone_label')}</span>
                  <span className="flex items-center gap-1 text-secondary-600">
                    <Phone className="h-3.5 w-3.5" />
                    {/* phone not in notification.reservation — show from metadata */}
                    {(notification?.metadata as Record<string, string> | null)?.phone ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary-500">{t('reservation.date_label')}</span>
                  <span className="text-secondary-600">
                    {format(new Date(res.date), 'dd.MM.yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary-500">{t('reservation.time_label')}</span>
                  <span className="text-secondary-600">{res.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary-500">{t('reservation.table_type_label')}</span>
                  <span className="text-secondary-600">
                    {t(`reservation.table_${res.tableType.toLowerCase()}`)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tertiary-500">{t('reservation.guests_label')}</span>
                  <span className="text-secondary-600">
                    {t('reservation.guests_count', { count: res.numberOfGuests })}
                  </span>
                </div>
                {res.specialRequest && (
                  <div>
                    <span className="text-tertiary-500">{t('reservation.special_request')}</span>
                    <p className="mt-1 italic text-tertiary-500">{res.specialRequest}</p>
                  </div>
                )}
              </div>

              {/* Actions for PENDING */}
              {status === 'PENDING' && (
                <>
                  <Separator className="my-4" />

                  {confirmAction === null && (
                    <>
                      <div className="mb-3">
                        <label className="mb-1 block text-sm text-tertiary-500">
                          {t('notifications.note_optional')}
                        </label>
                        <Textarea
                          rows={2}
                          placeholder={t('notifications.note_placeholder')}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full border-red-300 text-red-500 hover:bg-red-50"
                          onClick={() => setConfirmAction('reject')}
                        >
                          {t('notifications.reject_reservation')}
                        </Button>
                        <Button
                          className="w-full bg-green-600 text-white hover:bg-green-700"
                          onClick={() => setConfirmAction('confirm')}
                        >
                          {t('notifications.confirm_reservation')}
                        </Button>
                      </div>
                    </>
                  )}

                  {confirmAction === 'confirm' && (
                    <div>
                      <p className="mb-3 text-center text-sm text-secondary-600">
                        Da li ste sigurni da želite potvrditi ovu rezervaciju?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setConfirmAction(null)}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          className="w-full bg-green-600 text-white hover:bg-green-700"
                          disabled={confirmMutation.isPending}
                          onClick={() => {
                            confirmMutation.mutate(res.id, {
                              onSuccess: () => {
                                if (notification?.id) {
                                  markAsReadMutation.mutate(notification.id);
                                }
                                onActionComplete();
                                onClose();
                              },
                            });
                          }}
                        >
                          {confirmMutation.isPending
                            ? t('common.loading')
                            : t('notifications.confirm_reservation')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {confirmAction === 'reject' && (
                    <div>
                      <p className="mb-3 text-center text-sm text-secondary-600">
                        Da li ste sigurni da želite odbiti ovu rezervaciju?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setConfirmAction(null)}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          className="w-full bg-red-600 text-white hover:bg-red-700"
                          disabled={rejectMutation.isPending}
                          onClick={() => {
                            rejectMutation.mutate(
                              { id: res.id, note: note || undefined },
                              {
                                onSuccess: () => {
                                  if (notification?.id) {
                                    markAsReadMutation.mutate(notification.id);
                                  }
                                  onActionComplete();
                                  onClose();
                                },
                              },
                            );
                          }}
                        >
                          {rejectMutation.isPending
                            ? t('common.loading')
                            : t('notifications.reject_reservation')}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
