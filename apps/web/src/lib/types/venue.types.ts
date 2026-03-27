import type { VenueType, TableType, PaymentMethod } from '@rezz/shared';

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
  type: TableType;
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
  type: VenueType;
  reservationPhone: string;
  reservationEmail?: string;
  workingHours?: WorkingHours;
  paymentMethods: PaymentMethod[];
  hasParking: boolean;
  tags?: string[];
  tables?: VenueTableItem[];
  manager: VenueManager;
}

export interface AdminVenue {
  id: string;
  name: string;
  type: VenueType;
  reservationPhone: string;
  reservationEmail: string | null;
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
  createdAt: string;
  updatedAt: string;
}
