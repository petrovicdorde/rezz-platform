import type { ReservationStatus, ReservationSource, TableType } from '@rezz/shared';

export interface Reservation {
  id: string;
  venueId: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phone: string;
  numberOfGuests: number;
  tableType: TableType;
  specialRequest: string | null;
  status: ReservationStatus;
  source: ReservationSource;
  createdByManagerId: string | null;
  userId: string | null;
  arrivedAt: string | null;
  arrivalNote: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  guestRating: GuestRating | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuestRating {
  id: string;
  rating: number;
  note: string | null;
  reservationId: string;
  ratedById: string;
  isAutomatic: boolean;
  createdAt: string;
}

export interface AvailableSlots {
  tableType: TableType;
  total: number;
  reserved: number;
  available: number;
}

export interface CreateReservationRequest {
  firstName: string;
  lastName: string;
  phone: string;
  date: string;
  time: string;
  numberOfGuests: number;
  tableType: TableType;
  specialRequest?: string;
}

export interface GuestRatingRequest {
  rating: number;
  note?: string;
}
