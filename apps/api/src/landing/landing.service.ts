import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { LandingConfig } from './entities/landing-config.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Event } from '../events/entities/event.entity';
import { UpdateLandingConfigDto } from './dto/update-landing-config.dto';

@Injectable()
export class LandingService {
  constructor(
    @InjectRepository(LandingConfig)
    private readonly configRepo: Repository<LandingConfig>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    private readonly i18n: I18nService,
  ) {}

  async getConfig(): Promise<LandingConfig> {
    const existing = await this.configRepo.findOne({ where: {} });
    if (existing) return existing;

    const config = this.configRepo.create({
      featuredVenueIds: [],
      featuredEventIds: [],
      showFeaturedVenues: true,
      showFeaturedEvents: false,
    });
    return this.configRepo.save(config);
  }

  async getPublicLandingData(): Promise<{
    config: LandingConfig;
    featuredVenues: Venue[];
    featuredEvents: Event[];
  }> {
    const config = await this.getConfig();
    let featuredVenues: Venue[] = [];
    let featuredEvents: Event[] = [];

    if (config.showFeaturedVenues) {
      if (config.featuredVenueIds.length > 0) {
        const venues = await this.venueRepo.find({
          where: { id: In(config.featuredVenueIds), isActive: true },
          relations: ['tables'],
        });
        featuredVenues = config.featuredVenueIds
          .map((id) => venues.find((v) => v.id === id))
          .filter((v): v is Venue => v !== undefined);
      } else {
        featuredVenues = await this.venueRepo.find({
          where: { isActive: true },
          relations: ['tables'],
          order: { createdAt: 'DESC' },
          take: 6,
        });
      }
    }

    if (config.showFeaturedEvents && config.featuredEventIds.length > 0) {
      featuredEvents = await this.eventRepo.find({
        where: {
          id: In(config.featuredEventIds),
          startsAt: MoreThanOrEqual(new Date()),
        },
        relations: ['promotions'],
        order: { startsAt: 'ASC' },
      });
    }

    return { config, featuredVenues, featuredEvents };
  }

  async updateConfig(
    dto: UpdateLandingConfigDto,
    lang: string = 'sr',
  ): Promise<{ message: string; config: LandingConfig }> {
    const config = await this.getConfig();

    if (dto.featuredVenueIds !== undefined)
      config.featuredVenueIds = dto.featuredVenueIds;
    if (dto.featuredEventIds !== undefined)
      config.featuredEventIds = dto.featuredEventIds;
    if (dto.showFeaturedVenues !== undefined)
      config.showFeaturedVenues = dto.showFeaturedVenues;
    if (dto.showFeaturedEvents !== undefined)
      config.showFeaturedEvents = dto.showFeaturedEvents;

    const saved = await this.configRepo.save(config);

    return {
      message: await this.i18n.t('landing.config_updated', { lang }),
      config: saved,
    };
  }
}
