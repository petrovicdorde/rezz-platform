import { format } from 'date-fns';
import i18n from '@/i18n';
import type { Notification } from '@/lib/types/notification.types';

export function getNotificationText(notification: Notification): string {
  const meta = notification.metadata as Record<string, string> | null;
  const res = notification.reservation;

  const firstName = meta?.firstName ?? res?.firstName ?? '';
  const lastName = meta?.lastName ?? res?.lastName ?? '';
  const rawDate = meta?.date ?? res?.date;
  const date = rawDate ? format(new Date(rawDate), 'dd.MM.yyyy') : '';
  const time = meta?.time ?? res?.time ?? '';

  switch (notification.type) {
    case 'RESERVATION_NEW':
      return i18n.t('notifications.reservation_new', { firstName, lastName, date, time });
    case 'RESERVATION_CONFIRMED':
      return i18n.t('notifications.reservation_confirmed', { firstName, lastName });
    case 'RESERVATION_REJECTED':
      return i18n.t('notifications.reservation_rejected', { firstName, lastName });
    case 'RESERVATION_CANCELLED':
      return i18n.t('notifications.reservation_cancelled', { firstName, lastName, date, time });
    case 'RESERVATION_REMINDER':
      return i18n.t('notifications.reservation_reminder', { firstName, lastName, time });
    default:
      return '';
  }
}
