import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SetBlacklistDto {
  @IsBoolean()
  isBlacklisted: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
