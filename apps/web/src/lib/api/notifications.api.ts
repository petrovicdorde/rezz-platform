import { api } from '@/lib/api';
import type { Notification } from '@/lib/types/notification.types';

export const notificationsApi = {
  getAll: async (venueId: string): Promise<Notification[]> => {
    const response = await api.get<Notification[]>(
      `/venues/${venueId}/notifications`,
    );
    return response.data;
  },

  getUnreadCount: async (venueId: string): Promise<number> => {
    const response = await api.get<number>(
      `/venues/${venueId}/notifications/unread-count`,
    );
    return response.data;
  },

  markAsRead: async (venueId: string, id: string): Promise<Notification> => {
    const response = await api.patch<Notification>(
      `/venues/${venueId}/notifications/${id}/read`,
    );
    return response.data;
  },

  markAllAsRead: async (venueId: string): Promise<void> => {
    await api.patch(`/venues/${venueId}/notifications/read-all`);
  },
};
