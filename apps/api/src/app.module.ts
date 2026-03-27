import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule, AcceptLanguageResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { User } from './users/entities/user.entity';
import { Venue } from './venues/entities/venue.entity';
import { VenueTable } from './venues/entities/venue-table.entity';
import { VenueInvitation } from './venues/entities/venue-invitation.entity';
import { VenuesModule } from './venues/venues.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: parseInt(configService.get('DATABASE_PORT') ?? '5432'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User, Venue, VenueTable, VenueInvitation],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'sr',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: HeaderResolver, options: ['accept-language'] },
        AcceptLanguageResolver,
      ],
    }),
    UsersModule,
    AuthModule,
    EmailModule,
    VenuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
