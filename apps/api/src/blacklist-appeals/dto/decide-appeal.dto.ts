import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class DecideAppealDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
