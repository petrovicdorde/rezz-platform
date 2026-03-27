import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Venue } from './entities/venue.entity';
import { VenueTable } from './entities/venue-table.entity';
import { VenueInvitation } from './entities/venue-invitation.entity';
import { UsersService } from '../users/users.service';
import { InvitationsService } from './invitations.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import {
  AdminVenueDto,
  PublicVenueDto,
  VenueMapper,
} from './dto/venue-response.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venueRepo: Repository<Venue>,
    @InjectRepository(VenueTable)
    private tableRepo: Repository<VenueTable>,
    @InjectRepository(VenueInvitation)
    private invitationRepo: Repository<VenueInvitation>,
    private i18n: I18nService,
    private usersService: UsersService,
    @Inject(forwardRef(() => InvitationsService))
    private invitationsService: InvitationsService,
  ) {}

  private async toAdminDto(venue: Venue): Promise<AdminVenueDto> {
    const manager = await this.usersService.findManagerByVenueId(venue.id);
    return VenueMapper.toAdmin(venue, manager);
  }

  async findAllAdmin(lang: string = 'sr'): Promise<AdminVenueDto[]> {
    const venues = await this.venueRepo.find({
      relations: ['tables'],
      order: { createdAt: 'DESC' },
    });

    return Promise.all(venues.map((v) => this.toAdminDto(v)));
  }

  async findAllPublic(): Promise<PublicVenueDto[]> {
    const venues = await this.venueRepo.find({
      where: { isActive: true },
      relations: ['tables'],
      order: { name: 'ASC' },
    });

    return venues.map((v) => VenueMapper.toPublic(v));
  }

  async findOneAdmin(
    id: string,
    lang: string = 'sr',
  ): Promise<AdminVenueDto> {
    const venue = await this.venueRepo.findOne({
      where: { id },
      relations: ['tables'],
    });

    if (!venue) {
      throw new NotFoundException(
        await this.i18n.t('venue.not_found', { lang }),
      );
    }

    return this.toAdminDto(venue);
  }

  async findOnePublic(
    id: string,
    lang: string = 'sr',
  ): Promise<PublicVenueDto> {
    const venue = await this.venueRepo.findOne({
      where: { id, isActive: true },
      relations: ['tables'],
    });

    if (!venue) {
      throw new NotFoundException(
        await this.i18n.t('venue.not_found', { lang }),
      );
    }

    return VenueMapper.toPublic(venue);
  }

  async create(
    dto: CreateVenueDto,
    lang: string = 'sr',
  ): Promise<AdminVenueDto> {
    const existing = await this.venueRepo.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(
        await this.i18n.t('venue.name_already_exists', { lang }),
      );
    }

    const venue = this.venueRepo.create({
      name: dto.name,
      type: dto.type,
      reservationPhone: dto.reservationPhone,
      reservationEmail: dto.reservationEmail ?? null,
      workingHours: dto.workingHours ?? {},
      paymentMethods: dto.paymentMethods,
      hasParking: dto.hasParking,
      tags: dto.tags ?? [],
    });

    const savedVenue = await this.venueRepo.save(venue);

    if (dto.tables && dto.tables.length > 0) {
      const tables = dto.tables.map((t) =>
        this.tableRepo.create({
          type: t.type,
          count: t.count,
          note: t.note ?? null,
          venueId: savedVenue.id,
        }),
      );
      await this.tableRepo.save(tables);
    }

    if (dto.manager) {
      await this.invitationsService.sendInvitation(
        savedVenue.id,
        {
          email: dto.manager.email,
          phone: dto.manager.phone,
          firstName: dto.manager.firstName,
          lastName: dto.manager.lastName,
          role: 'MANAGER',
        },
        lang,
      );
    }

    return this.findOneAdmin(savedVenue.id, lang);
  }

  async update(
    id: string,
    dto: UpdateVenueDto,
    lang: string = 'sr',
  ): Promise<AdminVenueDto> {
    const venue = await this.venueRepo.findOne({
      where: { id },
      relations: ['tables'],
    });

    if (!venue) {
      throw new NotFoundException(
        await this.i18n.t('venue.not_found', { lang }),
      );
    }

    if (dto.name && dto.name !== venue.name) {
      const existing = await this.venueRepo.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException(
          await this.i18n.t('venue.name_already_exists', { lang }),
        );
      }
    }

    this.venueRepo.merge(venue, {
      name: dto.name,
      type: dto.type,
      reservationPhone: dto.reservationPhone,
      reservationEmail: dto.reservationEmail,
      workingHours: dto.workingHours,
      paymentMethods: dto.paymentMethods,
      hasParking: dto.hasParking,
      tags: dto.tags,
    });

    await this.venueRepo.save(venue);

    if (dto.tables) {
      await this.tableRepo.delete({ venueId: id });

      const tables = dto.tables.map((t) =>
        this.tableRepo.create({
          type: t.type,
          count: t.count,
          note: t.note ?? null,
          venueId: id,
        }),
      );
      await this.tableRepo.save(tables);
    }

    return this.findOneAdmin(id, lang);
  }

  async remove(
    id: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const venue = await this.venueRepo.findOne({
      where: { id },
    });

    if (!venue) {
      throw new NotFoundException(
        await this.i18n.t('venue.not_found', { lang }),
      );
    }

    await this.tableRepo.delete({ venueId: id });
    await this.invitationRepo.delete({ venueId: id });
    await this.venueRepo.remove(venue);

    return { message: await this.i18n.t('venue.deleted', { lang }) };
  }

  async setActive(
    id: string,
    isActive: boolean,
    lang: string = 'sr',
  ): Promise<AdminVenueDto> {
    const venue = await this.venueRepo.findOne({
      where: { id },
      relations: ['tables'],
    });

    if (!venue) {
      throw new NotFoundException(
        await this.i18n.t('venue.not_found', { lang }),
      );
    }

    venue.isActive = isActive;
    await this.venueRepo.save(venue);

    return this.toAdminDto(venue);
  }
}
