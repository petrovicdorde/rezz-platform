import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistAppeal } from './entities/blacklist-appeal.entity';
import { User } from '../users/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { EmailModule } from '../email/email.module';
import { BlacklistAppealsService } from './blacklist-appeals.service';
import { BlacklistAppealsController } from './blacklist-appeals.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlacklistAppeal, User, Notification]),
    EmailModule,
  ],
  controllers: [BlacklistAppealsController],
  providers: [BlacklistAppealsService],
  exports: [BlacklistAppealsService],
})
export class BlacklistAppealsModule {}
