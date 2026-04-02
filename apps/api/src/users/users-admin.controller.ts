import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from './entities/user.entity';
import { UsersAdminService } from './users-admin.service';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { SetBlacklistDto } from './dto/set-blacklist.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UsersAdminController {
  constructor(private readonly usersAdminService: UsersAdminService) {}

  @Get()
  findAll(
    @Query('role') role: UserRole,
    @Query('isActive') isActive: string,
    @Query('isBlacklisted') isBlacklisted: string,
    @Query('search') search: string,
    @I18nLang() lang: string,
  ) {
    return this.usersAdminService.findAll({
      role: role || undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isBlacklisted:
        isBlacklisted !== undefined ? isBlacklisted === 'true' : undefined,
      search: search || undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @I18nLang() lang: string) {
    return this.usersAdminService.findOne(id, lang);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.usersAdminService.updateUser(id, dto, user.id, lang);
  }

  @Patch(':id/active')
  setActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.usersAdminService.setActive(id, isActive, user.id, lang);
  }

  @Patch(':id/blacklist')
  setBlacklisted(
    @Param('id') id: string,
    @Body() dto: SetBlacklistDto,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.usersAdminService.setBlacklisted(
      id,
      dto.isBlacklisted,
      user.id,
      dto.reason,
      lang,
    );
  }
}
