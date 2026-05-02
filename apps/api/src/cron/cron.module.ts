import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Venue } from '../venues/entities/venue.entity';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { CronAuthGuard } from './cron-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Reservation, Venue])],
  controllers: [CronController],
  providers: [CronService, CronAuthGuard],
})
export class CronModule {}
