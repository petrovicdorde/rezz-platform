export interface VenueEvent {
  id: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  imageUrl: string | null;
  isActive: boolean;
  address: string;
  venueId: string;
  promotions: EventPromotion[];
  createdAt: string;
  updatedAt: string;
}

export interface EventPromotion {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  eventId: string;
  createdAt: string;
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  imageUrl?: string;
  promotions?: {
    name: string;
    price: number;
    imageUrl?: string;
  }[];
}

export interface CreatePromotionRequest {
  name: string;
  price: number;
  imageUrl?: string;
}
