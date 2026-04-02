import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsEnum(['MANAGER', 'WORKER', 'GUEST'])
  role?: 'MANAGER' | 'WORKER' | 'GUEST';
}
