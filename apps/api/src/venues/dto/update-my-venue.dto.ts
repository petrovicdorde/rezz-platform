import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { PaymentMethod, TableType } from '@rezz/shared';

class MyVenueDayHoursDto {
  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsBoolean()
  isClosed: boolean;
}

class MyVenueWorkingHoursDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => MyVenueDayHoursDto)
  monday?: MyVenueDayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MyVenueDayHoursDto)
  tuesday?: MyVenueDayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MyVenueDayHoursDto)
  wednesday?: MyVenueDayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MyVenueDayHoursDto)
  thursday?: MyVenueDayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MyVenueDayHoursDto)
  friday?: MyVenueDayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MyVenueDayHoursDto)
  saturday?: MyVenueDayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MyVenueDayHoursDto)
  sunday?: MyVenueDayHoursDto;
}

class MyVenueTableDto {
  @IsString()
  type: TableType;

  @IsInt()
  @Min(1)
  count: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateMyVenueDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MyVenueWorkingHoursDto)
  workingHours?: MyVenueWorkingHoursDto;

  @IsOptional()
  @IsArray()
  @IsEnum(['CASH', 'CARD', 'MOBILE'], { each: true })
  paymentMethods?: PaymentMethod[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MyVenueTableDto)
  tables?: MyVenueTableDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  socialLinks?: string[];
}
