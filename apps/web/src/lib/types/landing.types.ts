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
