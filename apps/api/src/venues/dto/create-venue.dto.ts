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
  Max,
  MinLength,
  IsUrl,
  ArrayMaxSize,
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
  @IsNotEmpty()
  @IsString()
  type: TableType;

  @IsInt()
  @Min(1)
  count: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ClosedDayDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(1)
  @Max(31)
  day: number;
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

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
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

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  city: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  address: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVenueTableDto)
  tables?: CreateVenueTableDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  socialLinks?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  minGuestAge?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(366)
  @ValidateNested({ each: true })
  @Type(() => ClosedDayDto)
  closedDays?: ClosedDayDto[];

  @ValidateNested()
  @Type(() => CreateManagerDto)
  manager: CreateManagerDto;
}
