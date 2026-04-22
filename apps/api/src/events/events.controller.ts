import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { UserRole } from '../users/entities/user.entity';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events/public/:id')
  findOnePublicById(@Param('id') id: string, @I18nLang() lang: string) {
    return this.eventsService.findOnePublicById(id, lang);
  }

  @Get('venues/:venueId/events/public')
  findAllPublic(@Param('venueId') venueId: string) {
    return this.eventsService.findAllPublicByVenue(venueId);
  }

  @Get('venues/:venueId/events/public/:id')
  findOnePublic(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    return this.eventsService.findOne(id, venueId, lang);
  }

  @Get('venues/:venueId/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  findAll(@Param('venueId') venueId: string) {
    return this.eventsService.findAllByVenue(venueId);
  }

  @Get('venues/:venueId/events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  findOne(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    return this.eventsService.findOne(id, venueId, lang);
  }

  @Post('venues/:venueId/events')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  create(
    @Param('venueId') venueId: string,
    @Body() dto: CreateEventDto,
    @I18nLang() lang: string,
  ) {
    return this.eventsService.create(venueId, dto, lang);
  }

  @Patch('venues/:venueId/events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  update(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @I18nLang() lang: string,
  ) {
    return this.eventsService.update(id, venueId, dto, lang);
  }

  @Delete('venues/:venueId/events/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  remove(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    return this.eventsService.remove(id, venueId, lang);
  }

  @Post('venues/:venueId/events/:id/promotions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  addPromotion(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body() dto: CreatePromotionDto,
    @I18nLang() lang: string,
  ) {
    return this.eventsService.addPromotion(id, venueId, dto, lang);
  }

  @Delete('venues/:venueId/events/:eventId/promotions/:promotionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  removePromotion(
    @Param('venueId') venueId: string,
    @Param('eventId') eventId: string,
    @Param('promotionId') promotionId: string,
    @I18nLang() lang: string,
  ) {
    return this.eventsService.removePromotion(
      eventId,
      promotionId,
      venueId,
      lang,
    );
  }
}
