export interface PublicVenue {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  reservationPhone: string;
  tags: string[];
  imageUrl: string | null;
  isActive: boolean;
  tables: { id: string; type: string; count: number; note: string | null }[];
  workingHours: Record<
    string,
    { open: string; close: string; isClosed: boolean }
  >;
  paymentMethods: string[];
  hasParking: boolean;
}

export interface PublicEvent {
  id: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  imageUrl: string | null;
  address: string;
  venueId: string;
  promotions: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  }[];
}

export interface LandingConfig {
  id: string;
  featuredVenueIds: string[];
  featuredEventIds: string[];
  showFeaturedVenues: boolean;
  showFeaturedEvents: boolean;
  updatedAt: string;
}

export interface UpdateLandingConfigRequest {
  featuredVenueIds?: string[];
  featuredEventIds?: string[];
  showFeaturedVenues?: boolean;
  showFeaturedEvents?: boolean;
}
