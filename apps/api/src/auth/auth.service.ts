import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleOAuthUser } from './strategies/google.strategy';

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  venueId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly i18n: I18nService,
    @InjectRepository(Venue) private readonly venueRepo: Repository<Venue>,
  ) {}

  async register(
    dto: RegisterDto,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(
        await this.i18n.t('auth.registration_failed', { lang }),
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      emailVerificationToken,
      emailVerificationTokenExpiresAt,
      isEmailVerified: false,
      isActive: false,
    });

    await this.emailService.sendVerificationEmail(
      dto.email,
      dto.firstName,
      emailVerificationToken,
      lang,
    );

    return { message: await this.i18n.t('auth.registration_success', { lang }) };
  }

  async verifyEmail(
    token: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const user = await this.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException(
        await this.i18n.t('auth.invalid_or_expired_token', { lang }),
      );
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        await this.i18n.t('auth.invalid_or_expired_token', { lang }),
      );
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      isActive: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });

    return { message: await this.i18n.t('auth.email_verified', { lang }) };
  }

  async login(dto: LoginDto, lang: string = 'sr'): Promise<{
    accessToken: string;
    refreshToken: string;
    user: SafeUser;
  }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(await this.i18n.t('auth.invalid_credentials', { lang }));
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException(await this.i18n.t('auth.invalid_credentials', { lang }));
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException(await this.i18n.t('auth.email_not_verified', { lang }));
    }

    if (!user.isActive) {
      throw new ForbiddenException(await this.i18n.t('auth.account_inactive', { lang }));
    }

    if (user.isBlacklisted) {
      throw new ForbiddenException(
        await this.i18n.t('auth.blacklisted', { lang }),
      );
    }

    if (
      (user.role === UserRole.MANAGER || user.role === UserRole.WORKER) &&
      user.venueId
    ) {
      const venue = await this.venueRepo.findOne({ where: { id: user.venueId } });
      if (venue && !venue.isActive) {
        throw new ForbiddenException(
          await this.i18n.t('auth.venue_blocked', { lang }),
        );
      }
    }

    return this.generateAuthResponse(user);
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException(await this.i18n.t('auth.invalid_credentials'));
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException(await this.i18n.t('auth.invalid_credentials'));
    }

    const accessToken = this.generateAccessToken(user);
    return { accessToken };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const passwordResetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.usersService.update(user.id, {
        passwordResetToken,
        passwordResetTokenExpiresAt,
      });

      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        passwordResetToken,
      );
    }

    return { message: await this.i18n.t('auth.reset_email_sent') };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.findByResetToken(dto.token);

    if (!user) {
      throw new BadRequestException(await this.i18n.t('auth.invalid_or_expired_token'));
    }

    if (user.passwordResetTokenExpiresAt && user.passwordResetTokenExpiresAt < new Date()) {
      throw new BadRequestException(await this.i18n.t('auth.invalid_or_expired_token'));
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.usersService.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
    });

    return { message: await this.i18n.t('auth.password_reset_success') };
  }

  async googleLogin(googleUser: GoogleOAuthUser): Promise<{
    accessToken: string;
    refreshToken: string;
    user: SafeUser;
  }> {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(googleUser.email);

      if (user) {
        user = await this.usersService.update(user.id, {
          googleId: googleUser.googleId,
          isEmailVerified: true,
        });
      } else {
        user = await this.usersService.create({
          googleId: googleUser.googleId,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          isEmailVerified: true,
        });
      }
    }

    return this.generateAuthResponse(user);
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.update(userId, { refreshTokenHash: null });
    return { message: await this.i18n.t('auth.logout_success') };
  }

  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      venueId: user.venueId ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async generateAuthResponse(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.usersService.update(user.id, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user: this.toSafeUser(user),
    };
  }

  private generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m') as any },
    );
  }

  private generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') as any },
    );
  }

  private async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersService.findByEmailVerificationToken(token);
  }

  private async findByResetToken(token: string): Promise<User | null> {
    return this.usersService.findByPasswordResetToken(token);
  }
}
