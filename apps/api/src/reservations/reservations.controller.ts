import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import type { TableType, ReservationStatus, ReservationSource } from '@rezz/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ArrivalDto } from './dto/arrival.dto';
import { GuestRatingDto } from './dto/guest-rating.dto';

@Controller('venues/:venueId/reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('available-slots')
  getAvailableSlots(
    @Param('venueId') venueId: string,
    @Query('date') date: string,
    @Query('tableType') tableType: TableType,
    @I18nLang() lang: string,
  ) {
    return this.reservationsService.getAvailableSlots(
      venueId,
      date,
      tableType,
      lang,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  findAll(
    @Param('venueId') venueId: string,
    @Query('status') status: ReservationStatus | ReservationStatus[],
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('source') source: ReservationSource,
    @I18nLang() lang: string,
  ) {
    const statusArray = status
      ? Array.isArray(status)
        ? status
        : [status]
      : undefined;

    return this.reservationsService.findAllByVenue(
      venueId,
      { status: statusArray, dateFrom, dateTo, source },
      lang,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  findOne(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    return this.reservationsService.findOne(id, venueId, lang);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  createByManager(
    @Param('venueId') venueId: string,
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.reservationsService.createByManager(
      venueId,
      dto,
      user.id,
      lang,
    );
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  confirm(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @I18nLang() lang: string,
  ) {
    return this.reservationsService.confirm(id, venueId, lang);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  reject(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body('note') note: string | undefined,
    @I18nLang() lang: string,
  ) {
    return this.reservationsService.reject(id, venueId, note, lang);
  }

  @Patch(':id/arrival')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.WORKER, UserRole.SUPER_ADMIN)
  recordArrival(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body() dto: ArrivalDto,
    @I18nLang() lang: string,
  ) {
    return this.reservationsService.recordArrival(id, venueId, dto, lang);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  cancel(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @I18nLang() lang: string,
  ) {
    return this.reservationsService.cancel(id, venueId, reason, lang);
  }

  @Post(':id/rate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  rateGuest(
    @Param('venueId') venueId: string,
    @Param('id') id: string,
    @Body() dto: GuestRatingDto,
    @CurrentUser() user: User,
    @I18nLang() lang: string,
  ) {
    return this.reservationsService.rateGuest(
      id,
      venueId,
      dto,
      user.id,
      lang,
    );
  }
}
