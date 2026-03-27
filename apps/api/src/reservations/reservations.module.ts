import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { GuestRating } from './entities/guest-rating.entity';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { VenuesModule } from '../venues/venues.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, GuestRating]),
    VenuesModule,
    UsersModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
