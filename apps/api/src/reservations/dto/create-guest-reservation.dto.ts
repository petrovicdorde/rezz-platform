import {
  Allow,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  Max,
  MinLength,
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

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  tableType: TableType;

  @IsOptional()
  @IsString()
  specialRequest?: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @Allow()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(120, { each: true })
  guestAges: number[];
}
