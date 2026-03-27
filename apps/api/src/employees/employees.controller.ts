import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { EmployeesService } from './employees.service';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { UpdateEmployeeRoleDto } from './dto/update-employee-role.dto';

@Controller('venues/:venueId/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(@Param('venueId') venueId: string) {
    return this.employeesService.findAllByVenue(venueId);
  }

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  invite(
    @Param('venueId') venueId: string,
    @Body() dto: InviteEmployeeDto,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.employeesService.invite(venueId, dto, user, lang);
  }

  @Delete(':employeeId')
  remove(
    @Param('venueId') venueId: string,
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.employeesService.removeEmployee(
      employeeId,
      venueId,
      user.id,
      lang,
    );
  }

  @Patch(':employeeId/role')
  updateRole(
    @Param('venueId') venueId: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateEmployeeRoleDto,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.employeesService.updateRole(
      employeeId,
      venueId,
      dto,
      user.id,
      lang,
    );
  }

  @Delete('invitations/:invitationId')
  cancelInvitation(
    @Param('venueId') venueId: string,
    @Param('invitationId') invitationId: string,
    @I18nLang() lang: string,
  ) {
    return this.employeesService.cancelInvitation(invitationId, venueId, lang);
  }
}
