import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { User } from '../users/entities/user.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface SafeProfileUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  googleId: string | null;
  createdAt: Date;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    private i18n: I18nService,
  ) {}

  private toSafeProfile(user: User): SafeProfileUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      googleId: user.googleId,
      createdAt: user.createdAt,
    };
  }

  async getProfile(
    userId: string,
    lang: string = 'sr',
  ): Promise<SafeProfileUser> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(this.i18n.t('profile.not_found', { lang }));
    }

    return this.toSafeProfile(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    lang: string = 'sr',
  ): Promise<SafeProfileUser> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(this.i18n.t('profile.not_found', { lang }));
    }

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName;
    }

    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName;
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone.trim();
    }

    const saved = await this.userRepo.save(user);
    return this.toSafeProfile(saved);
  }

  async getMyReservations(userId: string): Promise<{
    upcoming: Reservation[];
    history: Reservation[];
  }> {
    const upcoming = await this.reservationRepo
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.venue', 'venue')
      .where('reservation.userId = :userId', { userId })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: ['PENDING', 'CONFIRMED'],
      })
      .orderBy('reservation.date', 'ASC')
      .addOrderBy('reservation.time', 'ASC')
      .getMany();

    const history = await this.reservationRepo
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.venue', 'venue')
      .where('reservation.userId = :userId', { userId })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: ['COMPLETED', 'NO_SHOW', 'CANCELLED', 'REJECTED'],
      })
      .orderBy('reservation.date', 'DESC')
      .getMany();

    return { upcoming, history };
  }

  async cancelMyReservation(
    reservationId: string,
    userId: string,
    reason: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const reservation = await this.reservationRepo.findOne({
      where: { id: reservationId, userId },
    });

    if (!reservation) {
      throw new NotFoundException(
        this.i18n.t('profile.reservation_not_found', { lang }),
      );
    }

    const cancellable: string[] = ['PENDING', 'CONFIRMED'];

    if (!cancellable.includes(reservation.status)) {
      throw new BadRequestException(
        this.i18n.t('profile.cannot_cancel', { lang }),
      );
    }

    reservation.status = 'CANCELLED';
    reservation.cancellationReason = reason;
    reservation.cancelledAt = new Date();

    await this.reservationRepo.save(reservation);

    return {
      message: this.i18n.t('profile.cancelled', { lang }),
    };
  }
}
