import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelGuestReservationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  reason: string;
}
