import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Event } from './entities/event.entity';
import { EventPromotion } from './entities/event-promotion.entity';
import { Venue } from '../venues/entities/venue.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(EventPromotion)
    private promotionRepo: Repository<EventPromotion>,
    @InjectRepository(Venue)
    private venueRepo: Repository<Venue>,
    private i18n: I18nService,
  ) {}

  async findAllByVenue(venueId: string): Promise<Event[]> {
    return this.eventRepo.find({
      where: { venueId },
      relations: ['promotions'],
      order: { startsAt: 'DESC' },
    });
  }

  async findAllPublicByVenue(venueId: string): Promise<Event[]> {
    return this.eventRepo.find({
      where: {
        venueId,
        isActive: true,
        startsAt: MoreThanOrEqual(new Date()),
      },
      relations: ['promotions'],
      order: { startsAt: 'ASC' },
    });
  }

  async findOne(
    id: string,
    venueId: string,
    lang: string = 'sr',
  ): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id, venueId },
      relations: ['promotions'],
    });

    if (!event) {
      throw new NotFoundException(this.i18n.t('event.not_found', { lang }));
    }

    return event;
  }

  async create(
    venueId: string,
    dto: CreateEventDto,
    lang: string = 'sr',
  ): Promise<Event> {
    const venue = await this.venueRepo.findOne({ where: { id: venueId } });

    if (!venue) {
      throw new NotFoundException(this.i18n.t('venue.not_found', { lang }));
    }

    if (new Date(dto.startsAt) < new Date()) {
      throw new BadRequestException(
        this.i18n.t('event.already_past', { lang }),
      );
    }

    const event = this.eventRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      startsAt: new Date(dto.startsAt),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      imageUrl: dto.imageUrl ?? null,
      address: venue.address ?? venue.name,
      venueId,
      isActive: true,
    });

    const savedEvent = await this.eventRepo.save(event);

    if (dto.promotions && dto.promotions.length > 0) {
      const promotions = dto.promotions.map((p) =>
        this.promotionRepo.create({
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl ?? null,
          eventId: savedEvent.id,
        }),
      );
      await this.promotionRepo.save(promotions);
    }

    return this.findOne(savedEvent.id, venueId, lang);
  }

  async update(
    id: string,
    venueId: string,
    dto: UpdateEventDto,
    lang: string = 'sr',
  ): Promise<Event> {
    const event = await this.findOne(id, venueId, lang);

    if (dto.name !== undefined) event.name = dto.name;
    if (dto.description !== undefined)
      event.description = dto.description ?? null;
    if (dto.startsAt !== undefined) event.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined)
      event.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    if (dto.imageUrl !== undefined) event.imageUrl = dto.imageUrl ?? null;

    await this.eventRepo.save(event);

    if (dto.promotions !== undefined) {
      await this.promotionRepo.delete({ eventId: id });

      if (dto.promotions.length > 0) {
        const promotions = dto.promotions.map((p) =>
          this.promotionRepo.create({
            name: p.name,
            price: p.price,
            imageUrl: p.imageUrl ?? null,
            eventId: id,
          }),
        );
        await this.promotionRepo.save(promotions);
      }
    }

    return this.findOne(id, venueId, lang);
  }

  async remove(
    id: string,
    venueId: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    const event = await this.findOne(id, venueId, lang);
    await this.eventRepo.remove(event);
    return { message: this.i18n.t('event.deleted', { lang }) };
  }

  async addPromotion(
    eventId: string,
    venueId: string,
    dto: CreatePromotionDto,
    lang: string = 'sr',
  ): Promise<EventPromotion> {
    await this.findOne(eventId, venueId, lang);

    const promotion = this.promotionRepo.create({
      name: dto.name,
      price: dto.price,
      imageUrl: dto.imageUrl ?? null,
      eventId,
    });

    return this.promotionRepo.save(promotion);
  }

  async removePromotion(
    eventId: string,
    promotionId: string,
    venueId: string,
    lang: string = 'sr',
  ): Promise<{ message: string }> {
    await this.findOne(eventId, venueId, lang);

    const promotion = await this.promotionRepo.findOne({
      where: { id: promotionId, eventId },
    });

    if (!promotion) {
      throw new NotFoundException(
        this.i18n.t('event.promotion_not_found', { lang }),
      );
    }

    await this.promotionRepo.remove(promotion);
    return { message: this.i18n.t('event.promotion_deleted', { lang }) };
  }
}
