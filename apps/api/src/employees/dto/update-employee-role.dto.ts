import { IsEnum } from 'class-validator';

export class UpdateEmployeeRoleDto {
  @IsEnum(['MANAGER', 'WORKER'])
  role: 'MANAGER' | 'WORKER';
}
