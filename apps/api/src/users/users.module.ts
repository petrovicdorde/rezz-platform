import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersAdminService } from './users-admin.service';
import { UsersAdminController } from './users-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersAdminController],
  providers: [UsersService, UsersAdminService],
  exports: [UsersService, UsersAdminService],
})
export class UsersModule {}
