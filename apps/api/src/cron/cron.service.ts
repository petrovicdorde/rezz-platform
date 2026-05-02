import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Venue } from '../venues/entities/venue.entity';
import { EmailService } from '../email/email.service';

export interface ReminderRunSummary {
  totalManagers: number;
  remindedCount: number;
  skippedCount: number;
}

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(Venue) private readonly venueRepo: Repository<Venue>,
    private readonly emailService: EmailService,
  ) {}

  async sendPendingReservationReminders(): Promise<ReminderRunSummary> {
    const managers = await this.userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.MANAGER })
      .andWhere('user.isActive = true')
      .andWhere('user.venueId IS NOT NULL')
      .getMany();

    const summary: ReminderRunSummary = {
      totalManagers: managers.length,
      remindedCount: 0,
      skippedCount: 0,
    };

    for (const manager of managers) {
      try {
        if (!manager.venueId || !manager.email) {
          summary.skippedCount += 1;
          continue;
        }

        const venue = await this.venueRepo.findOne({
          where: { id: manager.venueId },
        });
        if (!venue || !venue.isActive) {
          summary.skippedCount += 1;
          continue;
        }

        const qb = this.reservationRepo
          .createQueryBuilder('reservation')
          .where('reservation.venueId = :venueId', { venueId: manager.venueId })
          .andWhere('reservation.status = :status', { status: 'PENDING' });

        if (manager.lastReservationReminderAt) {
          qb.andWhere('reservation.createdAt > :since', {
            since: manager.lastReservationReminderAt,
          });
        }

        const count = await qb.getCount();
        if (count === 0) {
          summary.skippedCount += 1;
          continue;
        }

        await this.emailService.sendManagerPendingReminderEmail(
          manager.email,
          manager.firstName ?? null,
          count,
        );

        manager.lastReservationReminderAt = new Date();
        await this.userRepo.save(manager);
        summary.remindedCount += 1;
      } catch (error) {
        this.logger.error(
          `Failed to process reminder for manager ${manager.id}`,
          error,
        );
        summary.skippedCount += 1;
      }
    }

    this.logger.log(
      `Reminder run complete: ${summary.remindedCount} sent, ${summary.skippedCount} skipped, ${summary.totalManagers} total managers.`,
    );
    return summary;
  }
}
