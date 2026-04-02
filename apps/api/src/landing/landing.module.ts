import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandingConfig } from './entities/landing-config.entity';
import { LandingService } from './landing.service';
import { LandingController } from './landing.controller';
import { Venue } from '../venues/entities/venue.entity';
import { Event } from '../events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LandingConfig, Venue, Event])],
  controllers: [LandingController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}
