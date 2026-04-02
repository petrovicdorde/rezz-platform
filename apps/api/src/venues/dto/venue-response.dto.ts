import type { VenueType, PaymentMethod, TableType } from '@rezz/shared';
import type { WorkingHours } from '../entities/venue.entity';
import { Venue } from '../entities/venue.entity';
import type { User } from '../../users/entities/user.entity';

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
  city: string;
  address: string;
  tables: PublicVenueTableDto[];
  isActive: boolean;
}

export class AdminVenueManagerDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

export class AdminVenueDto extends PublicVenueDto {
  reservationEmail: string | null;
  manager: AdminVenueManagerDto | null;
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
      city: venue.city,
      address: venue.address,
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

  static toAdmin(venue: Venue, manager?: User | null): AdminVenueDto {
    return {
      ...VenueMapper.toPublic(venue),
      reservationEmail: venue.reservationEmail,
      manager: manager
        ? {
            id: manager.id,
            email: manager.email,
            firstName: manager.firstName || null,
            lastName: manager.lastName || null,
            phone: null,
          }
        : null,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
    };
  }
}
