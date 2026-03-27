import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ArrivalDto {
  @IsEnum(['COMPLETED', 'NO_SHOW'])
  outcome: 'COMPLETED' | 'NO_SHOW';

  @IsOptional()
  @IsString()
  note?: string;
}
