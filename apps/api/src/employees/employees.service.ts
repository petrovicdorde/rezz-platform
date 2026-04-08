import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import * as crypto from 'crypto';
import { UserRole, User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { VenueInvitation } from '../venues/entities/venue-invitation.entity';
import { Venue } from '../venues/entities/venue.entity';
import { EmailService } from '../email/email.service';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { UpdateEmployeeRoleDto } from './dto/update-employee-role.dto';

export interface EmployeeListItem {
  id: string;
  type: 'ACTIVE' | 'INVITED';
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: 'MANAGER' | 'WORKER';
  isActive: boolean;
  invitationStatus?: 'PENDING' | 'EXPIRED';
  createdAt: Date;
}

@Injectable()
export class EmployeesService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(VenueInvitation)
    private invitationRepo: Repository<VenueInvitation>,
    @InjectRepository(Venue)
    private venueRepo: Repository<Venue>,
    private emailService: EmailService,
    private i18n: I18nService,
  ) {}

  async findAllByVenue(venueId: string): Promise<EmployeeListItem[]> {
    const users = await this.usersService.findByVenueId(venueId, [
      UserRole.MANAGER,
      UserRole.WORKER,
    ]);

    const pendingInvitations = await this.invitationRepo.find({
      where: { venueId, status: 'PENDING' as const },
      order: { createdAt: 'DESC' },
    });

    const activeItems: EmployeeListItem[] = users.map((u) => ({
      id: u.id,
      type: 'ACTIVE' as const,
      email: u.email,
      firstName: u.firstName || null,
      lastName: u.lastName || null,
      phone: null,
      role: u.role as 'MANAGER' | 'WORKER',
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    const invitedItems: EmployeeListItem[] = pendingInvitations.map((inv) => ({
      id: inv.id,
      type: 'INVITED' as const,
      email: inv.email,
      firstName: inv.firstName,
      lastName: inv.lastName,
      phone: inv.phone,
      role: inv.role as 'MANAGER' | 'WORKER',
      isActive: false,
      invitationStatus:
        inv.tokenExpiresAt < new Date()
          ? ('EXPIRED' as const)
          : ('PENDING' as const),
      createdAt: inv.createdAt,
    }));

    return [...activeItems, ...invitedItems];
  }

  async invite(
    venueId: string,
    dto: InviteEmployeeDto,
    invitedBy: User,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      if (existingUser.venueId === venueId) {
        throw new ConflictException(
          await this.i18n.t('employee.already_exists', { lang }),
        );
      }
      throw new ConflictException(
        await this.i18n.t('employee.email_taken', { lang }),
      );
    }

    const pendingInvitation = await this.invitationRepo.findOne({
      where: { email: dto.email, venueId, status: 'PENDING' as const },
    });

    if (pendingInvitation) {
      throw new ConflictException(
        await this.i18n.t('employee.invitation_pending', { lang }),
      );
    }

    const venue = await this.venueRepo.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new NotFoundException(
        await this.i18n.t('venue.not_found', { lang }),
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = this.invitationRepo.create({
      email: dto.email,
      phone: dto.phone,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      role: dto.role,
      token,
      tokenExpiresAt,
      venueId,
      status: 'PENDING' as const,
    });

    await this.invitationRepo.save(invitation);

    if (dto.role === 'MANAGER') {
      await this.emailService.sendManagerInvitationEmail(
        dto.email,
        venue.name,
        token,
        lang,
      );
    } else {
      await this.emailService.sendWorkerInvitationEmail(
        dto.email,
        venue.name,
        token,
        lang,
      );
    }

    return {
      message: await this.i18n.t('venue.invitation_sent', {
        lang,
        args: { email: dto.email },
      }),
    };
  }

  async removeEmployee(
    employeeId: string,
    venueId: string,
    requestingUserId: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(employeeId);

    if (!user || user.venueId !== venueId) {
      throw new NotFoundException(
        await this.i18n.t('employee.not_found', { lang }),
      );
    }

    if (employeeId === requestingUserId) {
      throw new BadRequestException(
        await this.i18n.t('employee.cannot_remove_self', { lang }),
      );
    }

    await this.usersService.update(employeeId, {
      venueId: null,
      isActive: false,
    });

    return { message: await this.i18n.t('employee.removed', { lang }) };
  }

  async updateRole(
    employeeId: string,
    venueId: string,
    dto: UpdateEmployeeRoleDto,
    requestingUserId: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const user = await this.usersService.findById(employeeId);

    if (!user || user.venueId !== venueId) {
      throw new NotFoundException(
        await this.i18n.t('employee.not_found', { lang }),
      );
    }

    if (employeeId === requestingUserId) {
      throw new BadRequestException(
        await this.i18n.t('employee.cannot_change_own_role', { lang }),
      );
    }

    await this.usersService.update(employeeId, {
      role: UserRole[dto.role as keyof typeof UserRole],
    });

    return { message: await this.i18n.t('employee.role_updated', { lang }) };
  }

  async cancelInvitation(
    invitationId: string,
    venueId: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId, venueId },
    });

    if (!invitation) {
      throw new NotFoundException(
        await this.i18n.t('employee.not_found', { lang }),
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        await this.i18n.t('employee.not_found', { lang }),
      );
    }

    invitation.status = 'EXPIRED' as const;
    await this.invitationRepo.save(invitation);

    return {
      message: await this.i18n.t('employee.invitation_cancelled', { lang }),
    };
  }
}
