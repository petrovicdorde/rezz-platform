import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { VenuesService } from './venues.service';
import { UpdateMyVenueDto } from './dto/update-my-venue.dto';

@Controller('my-venue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
export class MyVenueController {
  constructor(
    private readonly venuesService: VenuesService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  getMyVenue(@CurrentUser() user: User, @I18nLang() lang: string) {
    if (!user.venueId) {
      throw new NotFoundException(this.i18n.t('venue.not_found', { lang }));
    }
    return this.venuesService.findOneAdmin(user.venueId, lang);
  }

  @Patch()
  updateMyVenue(
    @CurrentUser() user: User,
    @Body() dto: UpdateMyVenueDto,
    @I18nLang() lang: string,
  ) {
    if (!user.venueId) {
      throw new ForbiddenException(this.i18n.t('venue.not_found', { lang }));
    }
    return this.venuesService.update(user.venueId, dto, lang);
  }
}
