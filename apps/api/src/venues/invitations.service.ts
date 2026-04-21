import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { Response } from 'express';
import { UserRole } from '../users/entities/user.entity';
import { VenueInvitation } from './entities/venue-invitation.entity';
import { Venue } from './entities/venue.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { User } from '../users/entities/user.entity';

interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  venueId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(VenueInvitation)
    private invitationRepo: Repository<VenueInvitation>,
    @InjectRepository(Venue)
    private venueRepo: Repository<Venue>,
    private usersService: UsersService,
    private emailService: EmailService,
    private i18n: I18nService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendInvitation(
    venueId: string,
    dto: CreateInvitationDto,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });

    if (!venue) {
      throw new NotFoundException(this.i18n.t('venue.not_found', { lang }));
    }

    const existingInvitation = await this.invitationRepo.findOne({
      where: {
        email: dto.email,
        venueId,
        status: In(['PENDING', 'ACCEPTED']),
      },
    });

    if (existingInvitation) {
      throw new ConflictException(
        this.i18n.t('venue.invitation_already_accepted', { lang }),
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
      message: this.i18n.t('venue.invitation_sent', {
        lang,
        args: { email: dto.email },
      }),
    };
  }

  async acceptInvitation(
    token: string,
    res: Response,
    lang: string = 'sr',
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );

    const invitation = await this.invitationRepo.findOne({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException(
        this.i18n.t('venue.invitation_not_found', { lang }),
      );
    }

    if (invitation.status === 'DECLINED') {
      throw new BadRequestException(
        this.i18n.t('venue.invitation_already_declined', { lang }),
      );
    }

    if (invitation.status === 'ACCEPTED') {
      throw new BadRequestException(
        this.i18n.t('venue.invitation_already_accepted', { lang }),
      );
    }

    if (invitation.tokenExpiresAt < new Date()) {
      invitation.status = 'EXPIRED' as const;
      await this.invitationRepo.save(invitation);
      throw new BadRequestException(
        this.i18n.t('venue.invitation_expired', { lang }),
      );
    }

    invitation.status = 'ACCEPTED' as const;
    invitation.acceptedAt = new Date();
    await this.invitationRepo.save(invitation);

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingUser = await this.usersService.findByEmail(invitation.email);

    if (existingUser) {
      await this.usersService.update(existingUser.id, {
        role: UserRole[invitation.role as keyof typeof UserRole],
        venueId: invitation.venueId,
        invitationToken,
        invitationTokenExpiresAt,
      });
      res.redirect(`${frontendUrl}/auth/set-password?token=${invitationToken}`);
    } else {
      await this.usersService.create({
        email: invitation.email,
        firstName: invitation.firstName ?? '',
        lastName: invitation.lastName ?? '',
        role: UserRole[invitation.role as keyof typeof UserRole],
        venueId: invitation.venueId,
        isEmailVerified: true,
        isActive: true,
        passwordHash: null,
        invitationToken,
        invitationTokenExpiresAt,
      });

      res.redirect(`${frontendUrl}/auth/set-password?token=${invitationToken}`);
    }
  }

  async declineInvitation(
    token: string,
    res: Response,
    lang: string = 'sr',
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );

    const invitation = await this.invitationRepo.findOne({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException(
        this.i18n.t('venue.invitation_not_found', { lang }),
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        this.i18n.t('venue.invitation_already_accepted', { lang }),
      );
    }

    invitation.status = 'DECLINED' as const;
    invitation.declinedAt = new Date();
    await this.invitationRepo.save(invitation);

    res.redirect(`${frontendUrl}/auth/invitation-declined`);
  }

  async setPasswordFromInvitation(
    token: string,
    password: string,
    lang: string = 'sr',
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: SafeUser;
    message: string;
  }> {
    const user = await this.usersService.findByInvitationToken(token);

    if (
      !user ||
      !user.invitationTokenExpiresAt ||
      user.invitationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        this.i18n.t('auth.invalid_or_expired_token', { lang }),
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await this.usersService.update(user.id, {
      passwordHash,
      invitationToken: null,
      invitationTokenExpiresAt: null,
    });

    const updatedUser = await this.usersService.findById(user.id);
    if (!updatedUser) {
      throw new BadRequestException(
        this.i18n.t('auth.invalid_or_expired_token', { lang }),
      );
    }

    const accessToken = this.generateAccessToken(updatedUser);
    const refreshToken = this.generateRefreshToken(updatedUser);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.usersService.update(updatedUser.id, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user: this.toSafeUser(updatedUser),
      message: this.i18n.t('auth.invitation_set_password_success', {
        lang,
      }),
    };
  }

  private generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      },
    );
  }

  private generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      venueId: user.venueId ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
