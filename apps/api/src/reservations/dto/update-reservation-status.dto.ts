import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { ReservationStatus } from '@rezz/shared';

export class UpdateReservationStatusDto {
  @IsEnum([
    'CONFIRMED',
    'REJECTED',
    'CANCELLED',
    'COMPLETED',
    'NO_SHOW',
  ])
  status: ReservationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
