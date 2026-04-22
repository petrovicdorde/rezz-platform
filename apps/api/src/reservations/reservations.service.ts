import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import type {
  TableType,
  ReservationStatus,
  ReservationSource,
  NotificationType,
} from '@rezz/shared';
import { Reservation } from './entities/reservation.entity';
import { GuestRating } from './entities/guest-rating.entity';
import { Venue } from '../venues/entities/venue.entity';
import { VenueTable } from '../venues/entities/venue-table.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateGuestReservationDto } from './dto/create-guest-reservation.dto';
import { ArrivalDto } from './dto/arrival.dto';
import { GuestRatingDto } from './dto/guest-rating.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    @InjectRepository(GuestRating)
    private ratingRepo: Repository<GuestRating>,
    @InjectRepository(Venue)
    private venueRepo: Repository<Venue>,
    @InjectRepository(VenueTable)
    private venueTableRepo: Repository<VenueTable>,
    private i18n: I18nService,
    private usersService: UsersService,
    private emailService: EmailService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  private async notifyVenueManagers(
    reservation: Reservation,
    type: NotificationType,
  ): Promise<void> {
    const managers = await this.usersService.findManagersByVenueId(
      reservation.venueId,
    );

    for (const manager of managers) {
      await this.notificationsService.createForReservation({
        userId: manager.id,
        type,
        reservation,
      });
    }
  }

  async getAvailableSlots(
    venueId: string,
    date: string,
    tableType: TableType,
    lang: string = 'sr',
  ): Promise<{
    tableType: TableType;
    total: number;
    reserved: number;
    available: number;
  }> {
    const venue = await this.venueRepo.findOne({
      where: { id: venueId },
      relations: ['tables'],
    });

    if (!venue) {
      throw new NotFoundException(this.i18n.t('venue.not_found', { lang }));
    }

    if (!venue.isActive) {
      throw new BadRequestException(
        this.i18n.t('reservation.venue_inactive', { lang }),
      );
    }

    const venueTable = await this.venueTableRepo.findOne({
      where: { venueId, type: tableType },
    });

    if (!venueTable) {
      throw new BadRequestException(
        this.i18n.t('reservation.table_type_not_available', { lang }),
      );
    }

    const reserved = await this.reservationRepo.count({
      where: {
        venueId,
        date,
        tableType,
        status: In(['PENDING', 'CONFIRMED']),
      },
    });

    return {
      tableType,
      total: venueTable.count,
      reserved,
      available: venueTable.count - reserved,
    };
  }

  async createByManager(
    venueId: string,
    dto: CreateReservationDto,
    managerId: string,
    lang: string = 'sr',
  ): Promise<Reservation> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(dto.date);

    if (reservationDate < today) {
      throw new BadRequestException(
        this.i18n.t('reservation.invalid_date', { lang }),
      );
    }

    const slots = await this.getAvailableSlots(
      venueId,
      dto.date,
      dto.tableType,
      lang,
    );

    if (slots.available <= 0) {
      throw new BadRequestException(
        this.i18n.t('reservation.no_available_tables', { lang }),
      );
    }

    const reservation = this.reservationRepo.create({
      venueId,
      date: dto.date,
      time: dto.time,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      numberOfGuests: dto.numberOfGuests,
      tableType: dto.tableType,
      specialRequest: dto.specialRequest ?? null,
      status: 'CONFIRMED',
      source: 'MANAGER',
      createdByManagerId: managerId,
    });

    return this.reservationRepo.save(reservation);
  }

  async createByGuest(
    venueId: string,
    dto: CreateGuestReservationDto,
    userId: string,
    lang: string = 'sr',
  ): Promise<Reservation> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.unauthorized', { lang }),
      );
    }

    if (user.isBlacklisted) {
      throw new ForbiddenException(
        this.i18n.t('reservation.blacklisted_cannot_reserve', { lang }),
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(dto.date);

    if (reservationDate < today) {
      throw new BadRequestException(
        this.i18n.t('reservation.invalid_date', { lang }),
      );
    }

    const slots = await this.getAvailableSlots(
      venueId,
      dto.date,
      dto.tableType,
      lang,
    );

    if (slots.available <= 0) {
      throw new BadRequestException(
        this.i18n.t('reservation.no_available_tables', { lang }),
      );
    }

    if (!user.phone || user.phone.trim() === '') {
      await this.usersService.updatePhone(userId, dto.phone);
    }

    const reservation = this.reservationRepo.create({
      venueId,
      date: dto.date,
      time: dto.time,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      numberOfGuests: dto.numberOfGuests,
      tableType: dto.tableType,
      specialRequest: dto.specialRequest ?? null,
      status: 'PENDING',
      source: 'GUEST_APP',
      createdByManagerId: null,
      userId,
      eventId: dto.eventId ?? null,
    });

    const saved = await this.reservationRepo.save(reservation);
    await this.notifyVenueManagers(saved, 'RESERVATION_NEW');
    return saved;
  }

  async findAllByVenue(
    venueId: string,
    filters: {
      status?: ReservationStatus[];
      dateFrom?: string;
      dateTo?: string;
      source?: ReservationSource;
    },
    _lang: string = 'sr',
  ): Promise<Reservation[]> {
    const qb = this.reservationRepo
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.createdByManager', 'createdByManager')
      .leftJoinAndSelect('reservation.user', 'user')
      .where('reservation.venueId = :venueId', { venueId });

    if (filters.status && filters.status.length > 0) {
      qb.andWhere('reservation.status IN (:...status)', {
        status: filters.status,
      });
    }

    if (filters.dateFrom) {
      qb.andWhere('reservation.date >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      qb.andWhere('reservation.date <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    if (filters.source) {
      qb.andWhere('reservation.source = :source', {
        source: filters.source,
      });
    }

    qb.orderBy('reservation.date', 'ASC').addOrderBy('reservation.time', 'ASC');

    return qb.getMany();
  }

  async findOne(
    id: string,
    venueId: string,
    lang: string = 'sr',
  ): Promise<Reservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { id, venueId },
      relations: ['createdByManager', 'user', 'guestRating'],
    });

    if (!reservation) {
      throw new NotFoundException(
        this.i18n.t('reservation.not_found', { lang }),
      );
    }

    return reservation;
  }

  async confirm(
    id: string,
    venueId: string,
    lang: string = 'sr',
  ): Promise<Reservation> {
    const reservation = await this.findOne(id, venueId, lang);

    if (reservation.status === 'CONFIRMED') {
      throw new BadRequestException(
        this.i18n.t('reservation.already_confirmed', { lang }),
      );
    }

    if (reservation.status !== 'PENDING') {
      throw new BadRequestException(
        this.i18n.t('reservation.cannot_reject', { lang }),
      );
    }

    reservation.status = 'CONFIRMED';
    const saved = await this.reservationRepo.save(reservation);
    await this.notifyVenueManagers(saved, 'RESERVATION_CONFIRMED');
    return saved;
  }

  async reject(
    id: string,
    venueId: string,
    note: string | undefined,
    lang: string = 'sr',
  ): Promise<Reservation> {
    const reservation = await this.findOne(id, venueId, lang);

    if (reservation.status !== 'PENDING') {
      throw new BadRequestException(
        this.i18n.t('reservation.cannot_reject', { lang }),
      );
    }

    reservation.status = 'REJECTED';
    reservation.cancellationReason = note ?? null;
    reservation.cancelledAt = new Date();
    const saved = await this.reservationRepo.save(reservation);
    await this.notifyVenueManagers(saved, 'RESERVATION_REJECTED');
    return saved;
  }

  async recordArrival(
    id: string,
    venueId: string,
    dto: ArrivalDto,
    userId: string,
    lang: string = 'sr',
  ): Promise<Reservation> {
    const reservation = await this.findOne(id, venueId, lang);

    if (
      reservation.status === 'COMPLETED' ||
      reservation.status === 'NO_SHOW'
    ) {
      throw new BadRequestException(
        this.i18n.t('reservation.already_completed', { lang }),
      );
    }

    if (reservation.status !== 'CONFIRMED') {
      throw new BadRequestException(
        this.i18n.t('reservation.cannot_cancel', { lang }),
      );
    }

    reservation.status = dto.outcome;
    reservation.arrivedAt = dto.outcome === 'COMPLETED' ? new Date() : null;
    reservation.arrivalNote = dto.note ?? null;
    const saved = await this.reservationRepo.save(reservation);

    if (dto.outcome === 'NO_SHOW') {
      const autoRating = this.ratingRepo.create({
        rating: 0,
        note: null,
        isAutomatic: true,
        reservationId: reservation.id,
        guestUserId: reservation.userId ?? null,
        ratedById: userId,
        venueId: reservation.venueId,
      });
      await this.ratingRepo.save(autoRating);

      if (reservation.userId) {
        const noShowCount = await this.reservationRepo.count({
          where: { phone: reservation.phone, status: 'NO_SHOW' as const },
        });

        if (noShowCount >= 3) {
          const guest = await this.usersService.findById(reservation.userId);
          if (guest && !guest.isBlacklisted) {
            await this.usersService.update(guest.id, {
              isBlacklisted: true,
              blacklistedAt: new Date(),
              blacklistReason: 'Automatski: 3 nepojavljivanja na rezervacijama',
            });
          }
        }
      }
    }

    return saved;
  }

  async rateGuest(
    reservationId: string,
    venueId: string,
    dto: GuestRatingDto,
    ratedById: string,
    lang: string = 'sr',
  ): Promise<GuestRating> {
    const reservation = await this.findOne(reservationId, venueId, lang);

    if (
      reservation.status !== 'COMPLETED' &&
      reservation.status !== 'NO_SHOW'
    ) {
      throw new BadRequestException(
        this.i18n.t('reservation.not_completed', { lang }),
      );
    }

    const existingRating = await this.ratingRepo.findOne({
      where: { reservationId },
    });

    if (existingRating) {
      throw new BadRequestException(
        this.i18n.t('reservation.already_rated', { lang }),
      );
    }

    const rating = this.ratingRepo.create({
      rating: dto.rating,
      note: dto.note ?? null,
      reservationId,
      guestUserId: reservation.userId ?? null,
      ratedById,
      venueId,
    });

    return this.ratingRepo.save(rating);
  }

  async updateRating(
    reservationId: string,
    venueId: string,
    dto: GuestRatingDto,
    _ratedById: string,
    lang: string = 'sr',
  ): Promise<GuestRating> {
    const reservation = await this.findOne(reservationId, venueId, lang);

    if (
      reservation.status !== 'COMPLETED' &&
      reservation.status !== 'NO_SHOW'
    ) {
      throw new BadRequestException(
        this.i18n.t('reservation.rating_only_completed', { lang }),
      );
    }

    const existingRating = await this.ratingRepo.findOne({
      where: { reservationId },
    });

    if (!existingRating) {
      throw new NotFoundException(
        this.i18n.t('reservation.rating_not_found', { lang }),
      );
    }

    existingRating.rating = dto.rating;
    existingRating.note = dto.note ?? null;
    existingRating.isAutomatic = false;
    return this.ratingRepo.save(existingRating);
  }

  async getGuestScore(
    guestPhone: string,
    _venueId: string,
  ): Promise<{
    averageRating: number | null;
    totalRatings: number;
    totalIncludingAutomatic: number;
    phone: string;
  }> {
    const reservations = await this.reservationRepo.find({
      where: {
        phone: guestPhone,
        status: In(['COMPLETED', 'NO_SHOW'] as const),
      },
      select: ['id'],
    });

    if (reservations.length === 0) {
      return {
        averageRating: null,
        totalRatings: 0,
        totalIncludingAutomatic: 0,
        phone: guestPhone,
      };
    }

    const reservationIds = reservations.map((r) => r.id);
    const ratings = await this.ratingRepo.find({
      where: { reservationId: In(reservationIds) },
    });

    if (ratings.length === 0) {
      return {
        averageRating: null,
        totalRatings: 0,
        totalIncludingAutomatic: 0,
        phone: guestPhone,
      };
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / ratings.length) * 10) / 10;
    const manualCount = ratings.filter((r) => !r.isAutomatic).length;

    return {
      averageRating: avg,
      totalRatings: manualCount,
      totalIncludingAutomatic: ratings.length,
      phone: guestPhone,
    };
  }

  async cancel(
    id: string,
    venueId: string,
    reason: string,
    lang: string = 'sr',
  ): Promise<Reservation> {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException(
        this.i18n.t('reservation.cancel_reason_required', { lang }),
      );
    }

    const reservation = await this.findOne(id, venueId, lang);

    const nonCancellable: string[] = [
      'COMPLETED',
      'NO_SHOW',
      'CANCELLED',
      'REJECTED',
    ];

    if (nonCancellable.includes(reservation.status)) {
      throw new BadRequestException(
        this.i18n.t('reservation.cannot_cancel', { lang }),
      );
    }

    reservation.status = 'CANCELLED';
    reservation.cancellationReason = reason;
    reservation.cancelledAt = new Date();
    const saved = await this.reservationRepo.save(reservation);
    await this.notifyVenueManagers(saved, 'RESERVATION_CANCELLED');

    if (reservation.userId) {
      try {
        const guest = await this.usersService.findById(reservation.userId);
        if (guest) {
          const venue = await this.venueRepo.findOne({
            where: { id: venueId },
          });
          await this.emailService.sendReservationCancelledEmail(
            guest.email,
            venue?.name ?? '',
            reservation.date,
            reservation.time,
            reason,
            lang,
          );
        }
      } catch {
        // Silent fail — don't block cancellation if email fails
      }
    }

    return saved;
  }
}
