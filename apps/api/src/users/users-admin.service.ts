import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

export interface SafeAdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  isBlacklisted: boolean;
  blacklistedAt: Date | null;
  blacklistReason: string | null;
  venueId: string | null;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersAdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  private toSafeAdminUser(user: User): SafeAdminUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? null,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isBlacklisted: user.isBlacklisted,
      blacklistedAt: user.blacklistedAt,
      blacklistReason: user.blacklistReason,
      venueId: user.venueId,
      googleId: user.googleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(filters: {
    role?: UserRole;
    isActive?: boolean;
    isBlacklisted?: boolean;
    search?: string;
  }): Promise<SafeAdminUser[]> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.role != :superAdmin', { superAdmin: UserRole.SUPER_ADMIN });

    if (filters.role) {
      qb.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.isBlacklisted !== undefined) {
      qb.andWhere('user.isBlacklisted = :isBlacklisted', {
        isBlacklisted: filters.isBlacklisted,
      });
    }

    if (filters.search) {
      const search = `%${filters.search}%`;
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search },
      );
    }

    qb.orderBy('user.createdAt', 'DESC');

    const users = await qb.getMany();
    return users.map((u) => this.toSafeAdminUser(u));
  }

  async findOne(id: string, lang: string = 'sr'): Promise<SafeAdminUser> {
    const user = await this.userRepo.findOne({
      where: { id, role: Not(UserRole.SUPER_ADMIN) },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.not_found', { lang }));
    }

    return this.toSafeAdminUser(user);
  }

  async setActive(
    id: string,
    isActive: boolean,
    requestingUserId: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    if (id === requestingUserId) {
      throw new BadRequestException(
        this.i18n.t('user.cannot_modify_self', { lang }),
      );
    }

    const user = await this.userRepo.findOne({
      where: { id, role: Not(UserRole.SUPER_ADMIN) },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.not_found', { lang }));
    }

    user.isActive = isActive;
    await this.userRepo.save(user);

    return {
      message: isActive
        ? this.i18n.t('user.activated', { lang })
        : this.i18n.t('user.deactivated', { lang }),
    };
  }

  async setBlacklisted(
    id: string,
    isBlacklisted: boolean,
    requestingUserId: string,
    reason?: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    if (id === requestingUserId) {
      throw new BadRequestException(
        this.i18n.t('user.cannot_modify_self', { lang }),
      );
    }

    const user = await this.userRepo.findOne({
      where: { id, role: Not(UserRole.SUPER_ADMIN) },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.not_found', { lang }));
    }

    if (isBlacklisted) {
      user.isBlacklisted = true;
      user.blacklistedAt = new Date();
      user.blacklistReason = reason ?? 'Ručno postavljeno od strane admina';
    } else {
      user.isBlacklisted = false;
      user.blacklistedAt = null;
      user.blacklistReason = null;
    }

    await this.userRepo.save(user);

    return {
      message: isBlacklisted
        ? this.i18n.t('user.blacklisted', { lang })
        : this.i18n.t('user.unblacklisted', { lang }),
    };
  }

  async updateUser(
    id: string,
    dto: UpdateUserAdminDto,
    requestingUserId: string,
    lang: string = 'sr',
  ): Promise<SafeAdminUser> {
    if (id === requestingUserId) {
      throw new BadRequestException(
        this.i18n.t('user.cannot_modify_self', { lang }),
      );
    }

    const user = await this.userRepo.findOne({
      where: { id, role: Not(UserRole.SUPER_ADMIN) },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.not_found', { lang }));
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.role !== undefined) user.role = dto.role as UserRole;

    const saved = await this.userRepo.save(user);
    return this.toSafeAdminUser(saved);
  }
}
