import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import type { NotificationType } from '@rezz/shared';
import { Notification } from './entities/notification.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private i18n: I18nService,
  ) {}

  async createForReservation(params: {
    userId: string;
    type: NotificationType;
    reservation: Reservation;
  }): Promise<Notification> {
    const { userId, type, reservation } = params;

    const metadata: Record<string, unknown> = {
      firstName: reservation.firstName,
      lastName: reservation.lastName,
      date: reservation.date,
      time: reservation.time,
      tableType: reservation.tableType,
      numberOfGuests: reservation.numberOfGuests,
      venueId: reservation.venueId,
    };

    const notification = this.notificationRepo.create({
      userId,
      type,
      reservationId: reservation.id,
      isRead: false,
      metadata,
    });

    return this.notificationRepo.save(notification);
  }

  async findAllForUser(
    userId: string,
    venueId: string,
  ): Promise<Notification[]> {
    return this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.reservation', 'reservation')
      .where('notification.userId = :userId', { userId })
      .andWhere("notification.metadata->>'venueId' = :venueId", { venueId })
      .orderBy('notification.createdAt', 'DESC')
      .limit(50)
      .getMany();
  }

  async markAsRead(
    id: string,
    userId: string,
    lang: string = 'sr',
  ): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(
        await this.i18n.t('notification.not_found', { lang }),
      );
    }

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string, venueId: string): Promise<void> {
    await this.notificationRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId', { userId })
      .andWhere('isRead = false')
      .andWhere("metadata->>'venueId' = :venueId", { venueId })
      .execute();
  }

  async getUnreadCount(userId: string, venueId: string): Promise<number> {
    return this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.isRead = false')
      .andWhere("notification.metadata->>'venueId' = :venueId", { venueId })
      .getCount();
  }

  async deleteOld(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.notificationRepo.delete({
      createdAt: LessThan(thirtyDaysAgo),
    });
  }
}
