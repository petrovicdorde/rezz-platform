export type UserRole = 'SUPER_ADMIN' | 'MANAGER' | 'WORKER' | 'GUEST';

export type VenueType =
  | 'RESTAURANT'
  | 'CAFE'
  | 'CAFFE_BAR'
  | 'LOUNGE'
  | 'CLUB'
  | 'FAST_FOOD'
  | 'PIZZERIA'
  | 'ROOFTOP'
  | 'SPORTS_BAR'
  | 'WINE_BAR'
  | 'HOOKAH_LOUNGE'
  | 'BAKERY';

export type TableType =
  | 'STANDARD'
  | 'BOOTH'
  | 'BAR_SEAT'
  | 'LOW_TABLE'
  | 'HIGH_TABLE'
  | 'TERRACE'
  | 'VIP';

export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE';

export type InvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type ReservationSource =
  | 'GUEST_APP'
  | 'MANAGER';

export type NotificationType =
  | 'RESERVATION_NEW'
  | 'RESERVATION_CONFIRMED'
  | 'RESERVATION_REJECTED'
  | 'RESERVATION_CANCELLED'
  | 'RESERVATION_REMINDER';

export type SettingType = 'CITY' | 'VENUE_TYPE' | 'TABLE_TYPE';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
