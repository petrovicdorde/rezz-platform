import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import type { TableType } from '@rezz/shared';

export class CreateGuestReservationDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM format',
  })
  time: string;

  @IsInt()
  @Min(1)
  numberOfGuests: number;

  @IsEnum([
    'STANDARD',
    'BOOTH',
    'BAR_SEAT',
    'LOW_TABLE',
    'HIGH_TABLE',
    'TERRACE',
    'VIP',
  ])
  tableType: TableType;

  @IsOptional()
  @IsString()
  specialRequest?: string;
}
