import type { NotificationType } from '@rezz/shared';

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
    date: string;
    time: string;
    tableType: string;
    numberOfGuests: number;
    status: string;
    specialRequest: string | null;
    source: string;
  } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
