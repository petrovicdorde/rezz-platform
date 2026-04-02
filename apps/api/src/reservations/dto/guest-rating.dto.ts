import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GuestRatingDto {
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  note?: string;
}
