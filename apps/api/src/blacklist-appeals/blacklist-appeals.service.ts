import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { User, UserRole } from '../users/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { EmailService } from '../email/email.service';
import { BlacklistAppeal } from './entities/blacklist-appeal.entity';
import { SubmitAppealDto } from './dto/submit-appeal.dto';
import { DecideAppealDto } from './dto/decide-appeal.dto';

const REJECTION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable()
export class BlacklistAppealsService {
  private readonly logger = new Logger(BlacklistAppealsService.name);

  constructor(
    @InjectRepository(BlacklistAppeal)
    private readonly appealRepo: Repository<BlacklistAppeal>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Returns the guest's most recent appeal (PENDING preferred, otherwise the
   * latest closed one). `null` if the user never appealed.
   */
  async findMyLatest(userId: string): Promise<BlacklistAppeal | null> {
    const pending = await this.appealRepo.findOne({
      where: { userId, status: 'PENDING' },
      order: { submittedAt: 'DESC' },
    });
    if (pending) return pending;
    const latest = await this.appealRepo.findOne({
      where: { userId },
      order: { submittedAt: 'DESC' },
    });
    return latest;
  }

  async submit(
    userId: string,
    dto: SubmitAppealDto,
    lang: string = 'sr',
  ): Promise<BlacklistAppeal> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(
        this.i18n.t('blacklist.user_not_found', { lang }),
      );
    }
    if (!user.isBlacklisted) {
      throw new BadRequestException(
        this.i18n.t('blacklist.appeal_not_blacklisted', { lang }),
      );
    }

    const latest = await this.findMyLatest(userId);
    if (latest?.status === 'PENDING') {
      throw new BadRequestException(
        this.i18n.t('blacklist.appeal_pending_already', { lang }),
      );
    }
    if (latest?.status === 'REJECTED' && latest.decidedAt) {
      const elapsed = Date.now() - latest.decidedAt.getTime();
      if (elapsed < REJECTION_COOLDOWN_MS) {
        throw new BadRequestException(
          this.i18n.t('blacklist.appeal_cooldown', { lang }),
        );
      }
    }

    const appeal = this.appealRepo.create({
      userId,
      message: dto.message,
      status: 'PENDING',
    });
    const saved = await this.appealRepo.save(appeal);

    // Fan out an in-app notification to every active super admin.
    try {
      const superAdmins = await this.userRepo.find({
        where: { role: UserRole.SUPER_ADMIN, isActive: true },
        select: ['id'],
      });
      if (superAdmins.length > 0) {
        const notifications = superAdmins.map((admin) =>
          this.notificationRepo.create({
            userId: admin.id,
            type: 'BLACKLIST_APPEAL_NEW',
            isRead: false,
            metadata: {
              appealId: saved.id,
              guestId: user.id,
              guestFirstName: user.firstName,
              guestLastName: user.lastName,
              guestEmail: user.email,
            },
          }),
        );
        await this.notificationRepo.save(notifications);
      }
    } catch (err) {
      this.logger.error(
        'Failed to fan out blacklist-appeal notifications',
        err,
      );
    }

    return saved;
  }

  /** Super-admin list — paginated by status, latest first. */
  async listForAdmin(
    statuses: BlacklistAppeal['status'][],
  ): Promise<BlacklistAppeal[]> {
    return this.appealRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user')
      .where('a.status IN (:...statuses)', { statuses })
      .orderBy("CASE WHEN a.status = 'PENDING' THEN 0 ELSE 1 END", 'ASC')
      .addOrderBy('a.submittedAt', 'DESC')
      .limit(200)
      .getMany();
  }

  async decide(
    appealId: string,
    adminId: string,
    dto: DecideAppealDto,
    lang: string = 'sr',
  ): Promise<BlacklistAppeal> {
    return this.dataSource.transaction(async (manager) => {
      const appealRepo = manager.getRepository(BlacklistAppeal);
      const userRepo = manager.getRepository(User);

      const appeal = await appealRepo.findOne({
        where: { id: appealId },
        relations: { user: true },
      });
      if (!appeal) {
        throw new NotFoundException(
          this.i18n.t('blacklist.appeal_not_found', { lang }),
        );
      }
      if (appeal.status !== 'PENDING') {
        throw new BadRequestException(
          this.i18n.t('blacklist.appeal_already_decided', { lang }),
        );
      }

      appeal.status = dto.status;
      appeal.adminNote = dto.adminNote ?? null;
      appeal.decidedByAdminId = adminId;
      appeal.decidedAt = new Date();
      const saved = await appealRepo.save(appeal);

      const user = appeal.user;

      if (dto.status === 'APPROVED') {
        await userRepo.update(
          { id: user.id },
          {
            isBlacklisted: false,
            blacklistedAt: null,
            blacklistReason: null,
          },
        );
      }

      // Email is best-effort — never block the decision.
      void this.notifyDecision(user, dto, lang);

      // Mark all admins' "new appeal" notifications for this appeal as read.
      try {
        const all = await manager
          .getRepository(Notification)
          .createQueryBuilder('n')
          .where("n.type = 'BLACKLIST_APPEAL_NEW'")
          .andWhere("(n.metadata ->> 'appealId') = :appealId", {
            appealId: appeal.id,
          })
          .getMany();
        if (all.length > 0) {
          await manager
            .getRepository(Notification)
            .update({ id: In(all.map((n) => n.id)) }, { isRead: true });
        }
      } catch (err) {
        this.logger.warn(
          'Failed to mark related blacklist-appeal notifications read',
          err as Error,
        );
      }

      return saved;
    });
  }

  /**
   * Used by the manual-unblacklist code path (super admin clears the user
   * directly from the user-detail drawer): if there's still a pending appeal,
   * close it as APPROVED with a system-generated note so the queue stays
   * clean.
   */
  async closePendingForUserAsAutoApproved(
    userId: string,
    adminId: string,
  ): Promise<void> {
    const pending = await this.appealRepo.findOne({
      where: { userId, status: 'PENDING' },
    });
    if (!pending) return;
    pending.status = 'APPROVED';
    pending.adminNote = 'Auto-resolved: user manually unblocked by admin.';
    pending.decidedByAdminId = adminId;
    pending.decidedAt = new Date();
    await this.appealRepo.save(pending);
  }

  private async notifyDecision(
    user: User,
    dto: DecideAppealDto,
    lang: string,
  ): Promise<void> {
    if (!user.email) return;
    try {
      if (dto.status === 'APPROVED') {
        await this.emailService.sendBlacklistAppealApprovedEmail(
          user.email,
          user.firstName ?? '',
          lang,
        );
      } else {
        await this.emailService.sendBlacklistAppealRejectedEmail(
          user.email,
          user.firstName ?? '',
          dto.adminNote ?? null,
          lang,
        );
      }
    } catch (err) {
      this.logger.error(
        `Failed to send blacklist-appeal decision email to ${user.email}`,
        err,
      );
    }
  }
}
