import type {
  VenueType,
  TableType,
  PaymentMethod,
  SocialLink,
} from '@rezz/shared';

export interface WorkingHourDay {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface WorkingHours {
  monday?: WorkingHourDay;
  tuesday?: WorkingHourDay;
  wednesday?: WorkingHourDay;
  thursday?: WorkingHourDay;
  friday?: WorkingHourDay;
  saturday?: WorkingHourDay;
  sunday?: WorkingHourDay;
}

export interface VenueTableItem {
  type: string;
  count: number;
  note?: string;
}

export interface VenueManager {
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateVenueRequest {
  name: string;
  type: string;
  reservationPhone: string;
  reservationEmail?: string;
  city: string;
  address: string;
  workingHours?: WorkingHours;
  paymentMethods: PaymentMethod[];
  hasParking: boolean;
  tags?: string[];
  tables?: VenueTableItem[];
  socialLinks?: string[];
  manager: VenueManager;
}

export interface PublicVenue {
  id: string;
  name: string;
  type: VenueType;
  city: string;
  address: string;
  reservationPhone: string;
  tags: string[];
  imageUrl: string | null;
  isActive: boolean;
  tables: { id: string; type: TableType; count: number; note: string | null }[];
  workingHours: WorkingHours;
  paymentMethods: PaymentMethod[];
  hasParking: boolean;
  socialLinks: SocialLink[];
  description?: string | null;
  images?: string[];
}

export interface AdminVenue {
  id: string;
  name: string;
  type: VenueType;
  reservationPhone: string;
  reservationEmail: string | null;
  city: string;
  address: string;
  workingHours: WorkingHours;
  paymentMethods: PaymentMethod[];
  hasParking: boolean;
  tags: string[];
  imageUrl: string | null;
  isActive: boolean;
  tables: {
    id: string;
    type: TableType;
    count: number;
    note: string | null;
  }[];
  manager?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
  } | null;
  socialLinkUrls?: string[];
  createdAt: string;
  updatedAt: string;
}
