import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { NotificationsService } from './notifications.service';

@Controller('venues/:venueId/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.WORKER)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  findAll(
    @Param('venueId') venueId: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.findAllForUser(user.id, venueId);
  }

  @Get('unread-count')
  getUnreadCount(
    @Param('venueId') venueId: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.getUnreadCount(user.id, venueId);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.notificationsService.markAsRead(id, user.id, lang);
  }

  @Patch('read-all')
  markAllAsRead(
    @Param('venueId') venueId: string,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.markAllAsRead(user.id, venueId);
  }
}
