import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';
import { UsersModule } from '../../users/users.module';
import { UsersService } from '../../users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(configService.get<string>('DATABASE_PORT') ?? '5432'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    UsersModule,
  ],
})
class SeedModule {}

async function seed() {
  console.log('Seeding database...');

  const app = await NestFactory.createApplicationContext(SeedModule);
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);

  const email = configService.get<string>('SUPER_ADMIN_EMAIL', 'admin@rezz.ba');
  const password = configService.get<string>('SUPER_ADMIN_PASSWORD', 'Admin123!');

  const existing = await usersService.findByEmail(email);

  if (existing) {
    console.log('SUPER_ADMIN already exists, skipping.');
  } else {
    const passwordHash = await bcrypt.hash(password, 12);

    await usersService.create({
      firstName: 'Super',
      lastName: 'Admin',
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    console.log(`SUPER_ADMIN created: ${email}`);
  }

  await app.close();
}

seed();
