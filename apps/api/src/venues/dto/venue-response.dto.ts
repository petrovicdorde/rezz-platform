import type { VenueType, PaymentMethod, TableType } from '@rezz/shared';
import type { WorkingHours } from '../entities/venue.entity';
import { Venue } from '../entities/venue.entity';

export class PublicVenueTableDto {
  id: string;
  type: TableType;
  count: number;
  note: string | null;
}

export class PublicVenueDto {
  id: string;
  name: string;
  type: VenueType;
  reservationPhone: string;
  workingHours: WorkingHours;
  paymentMethods: PaymentMethod[];
  hasParking: boolean;
  tags: string[];
  imageUrl: string | null;
  tables: PublicVenueTableDto[];
  isActive: boolean;
}

export class AdminVenueDto extends PublicVenueDto {
  reservationEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class VenueMapper {
  static toPublic(venue: Venue): PublicVenueDto {
    return {
      id: venue.id,
      name: venue.name,
      type: venue.type,
      reservationPhone: venue.reservationPhone,
      workingHours: venue.workingHours,
      paymentMethods: venue.paymentMethods,
      hasParking: venue.hasParking,
      tags: venue.tags,
      imageUrl: venue.imageUrl,
      isActive: venue.isActive,
      tables:
        venue.tables?.map((t) => ({
          id: t.id,
          type: t.type,
          count: t.count,
          note: t.note,
        })) ?? [],
    };
  }

  static toAdmin(venue: Venue): AdminVenueDto {
    return {
      ...VenueMapper.toPublic(venue),
      reservationEmail: venue.reservationEmail,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
    };
  }
}
