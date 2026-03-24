export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'WORKER' | 'GUEST';

export type VenueType = 'RESTAURANT' | 'CAFE' | 'BAR' | 'CLUB';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type TableType = 'STANDARD' | 'VIP' | 'BAR' | 'TERRACE' | 'PRIVATE';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
