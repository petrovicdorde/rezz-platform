import { api } from '@/lib/api';
import type {
  VenueEvent,
  CreateEventRequest,
  CreatePromotionRequest,
  EventPromotion,
} from '@/lib/types/event.types';

export const eventsApi = {
  getAll: async (venueId: string): Promise<VenueEvent[]> => {
    const response = await api.get<VenueEvent[]>(
      `/venues/${venueId}/events`,
    );
    return response.data;
  },

  getOne: async (venueId: string, id: string): Promise<VenueEvent> => {
    const response = await api.get<VenueEvent>(
      `/venues/${venueId}/events/${id}`,
    );
    return response.data;
  },

  create: async (
    venueId: string,
    data: CreateEventRequest,
  ): Promise<VenueEvent> => {
    const response = await api.post<VenueEvent>(
      `/venues/${venueId}/events`,
      data,
    );
    return response.data;
  },

  update: async (
    venueId: string,
    id: string,
    data: Partial<CreateEventRequest>,
  ): Promise<VenueEvent> => {
    const response = await api.patch<VenueEvent>(
      `/venues/${venueId}/events/${id}`,
      data,
    );
    return response.data;
  },

  remove: async (venueId: string, id: string): Promise<void> => {
    await api.delete(`/venues/${venueId}/events/${id}`);
  },

  addPromotion: async (
    venueId: string,
    eventId: string,
    data: CreatePromotionRequest,
  ): Promise<EventPromotion> => {
    const response = await api.post<EventPromotion>(
      `/venues/${venueId}/events/${eventId}/promotions`,
      data,
    );
    return response.data;
  },

  removePromotion: async (
    venueId: string,
    eventId: string,
    promotionId: string,
  ): Promise<void> => {
    await api.delete(
      `/venues/${venueId}/events/${eventId}/promotions/${promotionId}`,
    );
  },
};
