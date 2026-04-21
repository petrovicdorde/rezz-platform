import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { LandingService } from './landing.service';
import { UpdateLandingConfigDto } from './dto/update-landing-config.dto';

@Controller('landing')
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get()
  getPublicLandingData() {
    return this.landingService.getPublicLandingData();
  }

  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  getConfig() {
    return this.landingService.getConfig();
  }

  @Patch('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updateConfig(@Body() dto: UpdateLandingConfigDto, @I18nLang() lang: string) {
    return this.landingService.updateConfig(dto, lang);
  }
}
