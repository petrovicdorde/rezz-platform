import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { AdminVenueDto, PublicVenueDto } from './dto/venue-response.dto';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get('public')
  findAllPublic(
    @Query('type') type: string,
    @Query('city') city: string,
  ): Promise<PublicVenueDto[]> {
    return this.venuesService.findAllPublic({
      type: type || undefined,
      city: city || undefined,
    });
  }

  @Get('public/:id')
  findOnePublic(
    @Param('id') id: string,
    @I18nLang() lang: string,
  ): Promise<PublicVenueDto> {
    return this.venuesService.findOnePublic(id, lang);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findAllAdmin(@I18nLang() lang: string): Promise<AdminVenueDto[]> {
    return this.venuesService.findAllAdmin(lang);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  findOneAdmin(
    @Param('id') id: string,
    @I18nLang() lang: string,
  ): Promise<AdminVenueDto> {
    return this.venuesService.findOneAdmin(id, lang);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateVenueDto,
    @I18nLang() lang: string,
  ): Promise<AdminVenueDto> {
    return this.venuesService.create(dto, lang);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueDto,
    @I18nLang() lang: string,
  ): Promise<AdminVenueDto> {
    return this.venuesService.update(id, dto, lang);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  setActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @I18nLang() lang: string,
  ): Promise<AdminVenueDto> {
    return this.venuesService.setActive(id, isActive, lang);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(
    @Param('id') id: string,
    @I18nLang() lang: string,
  ): Promise<{ message: string }> {
    return this.venuesService.remove(id, lang);
  }
}
