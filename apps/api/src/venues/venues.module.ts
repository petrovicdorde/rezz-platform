import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity';
import { VenueTable } from './entities/venue-table.entity';
import { VenueInvitation } from './entities/venue-invitation.entity';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venue, VenueTable, VenueInvitation]),
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [VenuesController, InvitationsController],
  providers: [VenuesService, InvitationsService],
  exports: [VenuesService, InvitationsService, TypeOrmModule],
})
export class VenuesModule {}
