import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { ContactFormDto } from './dto/contact-form.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
    private readonly i18n: I18nService,
  ) {}

  async submit(
    dto: ContactFormDto,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const superAdmins = await this.userRepo.find({
      where: { role: UserRole.SUPER_ADMIN, isActive: true },
      select: ['email'],
    });

    const recipients = superAdmins
      .map((u) => u.email)
      .filter((e): e is string => Boolean(e));

    if (recipients.length === 0) {
      // No super admin to notify — log and still return success to the user so
      // we don't leak that no recipient exists. Operators will catch it via
      // monitoring/logs.
      this.logger.warn(
        'Contact form submitted but no active super admin recipient found.',
      );
    } else {
      await this.emailService.sendContactEmail(
        recipients,
        {
          fullName: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          message: dto.message,
        },
        lang,
      );
    }

    return { message: this.i18n.t('contact.success', { lang }) };
  }
}
