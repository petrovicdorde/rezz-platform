import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { VenueType, PaymentMethod, TableType } from '@rezz/shared';

class DayHoursDto {
  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsBoolean()
  isClosed: boolean;
}

class WorkingHoursDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  monday?: DayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  tuesday?: DayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  wednesday?: DayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  thursday?: DayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  friday?: DayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  saturday?: DayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  sunday?: DayHoursDto;
}

class CreateVenueTableDto {
  @IsEnum([
    'STANDARD',
    'BOOTH',
    'BAR_SEAT',
    'LOW_TABLE',
    'HIGH_TABLE',
    'TERRACE',
    'VIP',
  ])
  type: TableType;

  @IsInt()
  @Min(1)
  count: number;

  @IsOptional()
  @IsString()
  note?: string;
}

class CreateManagerDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class CreateVenueDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum([
    'RESTAURANT',
    'CAFE',
    'CAFFE_BAR',
    'LOUNGE',
    'CLUB',
    'FAST_FOOD',
    'PIZZERIA',
    'ROOFTOP',
    'SPORTS_BAR',
    'WINE_BAR',
    'HOOKAH_LOUNGE',
    'BAKERY',
  ])
  type: VenueType;

  @IsNotEmpty()
  @IsString()
  reservationPhone: string;

  @IsOptional()
  @IsEmail()
  reservationEmail?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto;

  @IsArray()
  @IsEnum(['CASH', 'CARD', 'MOBILE'], { each: true })
  paymentMethods: PaymentMethod[];

  @IsBoolean()
  hasParking: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVenueTableDto)
  tables?: CreateVenueTableDto[];

  @ValidateNested()
  @Type(() => CreateManagerDto)
  manager: CreateManagerDto;
}
