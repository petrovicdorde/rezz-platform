import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ProfileService, SafeProfileUser } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CancelGuestReservationDto } from './dto/cancel-guest-reservation.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GUEST)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ): Promise<SafeProfileUser> {
    return this.profileService.getProfile(user.id, lang);
  }

  @Patch()
  updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
    @I18nLang() lang: string,
  ): Promise<SafeProfileUser> {
    return this.profileService.updateProfile(user.id, dto, lang);
  }

  @Get('reservations')
  getMyReservations(
    @CurrentUser() user: User,
  ): Promise<{ upcoming: Reservation[]; history: Reservation[] }> {
    return this.profileService.getMyReservations(user.id);
  }

  @Patch('reservations/:id/cancel')
  cancelMyReservation(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: CancelGuestReservationDto,
    @I18nLang() lang: string,
  ): Promise<{ message: string }> {
    return this.profileService.cancelMyReservation(
      id,
      user.id,
      dto.reason,
      lang,
    );
  }
}
