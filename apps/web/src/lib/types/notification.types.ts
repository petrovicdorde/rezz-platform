import type { NotificationType } from '@rezz/shared';
import type { GuestRating } from './reservation.types';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  isRead: boolean;
  reservationId: string | null;
  reservation: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    date: string;
    time: string;
    tableType: string;
    numberOfGuests: number;
    status: string;
    specialRequest: string | null;
    source: string;
    guestRating: GuestRating | null;
  } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
