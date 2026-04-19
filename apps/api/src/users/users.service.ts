import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { emailVerificationToken: token } });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { passwordResetToken: token } });
  }

  async findByInvitationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { invitationToken: token } });
  }

  async findManagerByVenueId(venueId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { venueId, role: UserRole.MANAGER },
    });
  }

  async findManagersByVenueId(venueId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { venueId, role: UserRole.MANAGER, isActive: true },
    });
  }

  async findByVenueId(venueId: string, roles?: UserRole[]): Promise<User[]> {
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.venueId = :venueId', { venueId });

    if (roles && roles.length > 0) {
      qb.andWhere('user.role IN (:...roles)', { roles });
    }

    return qb.orderBy('user.role', 'ASC').addOrderBy('user.firstName', 'ASC').getMany();
  }

  async create(data: DeepPartial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: string, data: DeepPartial<User>): Promise<User> {
    await this.usersRepository.update(id, data);
    return this.usersRepository.findOneOrFail({ where: { id } });
  }

  async updatePhone(userId: string, phone: string): Promise<void> {
    await this.usersRepository.update(userId, { phone });
  }
}
