import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../settings/entities/setting.entity';

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
        entities: [Setting],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([Setting]),
  ],
})
class SeedSettingsModule {}

interface SeedItem {
  type: 'CITY' | 'VENUE_TYPE' | 'TABLE_TYPE';
  value: string;
  label: string;
  order: number;
}

const SEED_DATA: SeedItem[] = [
  // Cities
  { type: 'CITY', value: 'BANJA_LUKA', label: 'Banja Luka', order: 1 },
  { type: 'CITY', value: 'SARAJEVO', label: 'Sarajevo', order: 2 },
  { type: 'CITY', value: 'MOSTAR', label: 'Mostar', order: 3 },
  { type: 'CITY', value: 'TUZLA', label: 'Tuzla', order: 4 },
  { type: 'CITY', value: 'ZENICA', label: 'Zenica', order: 5 },
  { type: 'CITY', value: 'BIJELJINA', label: 'Bijeljina', order: 6 },
  { type: 'CITY', value: 'PRIJEDOR', label: 'Prijedor', order: 7 },
  { type: 'CITY', value: 'TREBINJE', label: 'Trebinje', order: 8 },
  { type: 'CITY', value: 'DOBOJ', label: 'Doboj', order: 9 },
  { type: 'CITY', value: 'BRCKO', label: 'Brčko', order: 10 },

  // Venue types
  { type: 'VENUE_TYPE', value: 'RESTAURANT', label: 'Restoran', order: 1 },
  { type: 'VENUE_TYPE', value: 'CAFE', label: 'Kafić', order: 2 },
  { type: 'VENUE_TYPE', value: 'CAFFE_BAR', label: 'Caffe bar', order: 3 },
  { type: 'VENUE_TYPE', value: 'LOUNGE', label: 'Lounge', order: 4 },
  { type: 'VENUE_TYPE', value: 'CLUB', label: 'Klub', order: 5 },
  { type: 'VENUE_TYPE', value: 'FAST_FOOD', label: 'Fast food', order: 6 },
  { type: 'VENUE_TYPE', value: 'PIZZERIA', label: 'Pizzeria', order: 7 },
  { type: 'VENUE_TYPE', value: 'ROOFTOP', label: 'Rooftop bar', order: 8 },
  { type: 'VENUE_TYPE', value: 'SPORTS_BAR', label: 'Sports bar', order: 9 },
  { type: 'VENUE_TYPE', value: 'WINE_BAR', label: 'Wine bar', order: 10 },
  { type: 'VENUE_TYPE', value: 'HOOKAH_LOUNGE', label: 'Nargilana', order: 11 },
  { type: 'VENUE_TYPE', value: 'BAKERY', label: 'Pekara', order: 12 },

  // Table types
  { type: 'TABLE_TYPE', value: 'STANDARD', label: 'Standardni sto', order: 1 },
  { type: 'TABLE_TYPE', value: 'BOOTH', label: 'Separe', order: 2 },
  { type: 'TABLE_TYPE', value: 'BAR_SEAT', label: 'Sank', order: 3 },
  { type: 'TABLE_TYPE', value: 'LOW_TABLE', label: 'Niski sto', order: 4 },
  { type: 'TABLE_TYPE', value: 'HIGH_TABLE', label: 'Visoki sto', order: 5 },
  { type: 'TABLE_TYPE', value: 'TERRACE', label: 'Terasa', order: 6 },
  { type: 'TABLE_TYPE', value: 'VIP', label: 'VIP', order: 7 },
];

async function seedSettings(): Promise<void> {
  console.log('Seeding settings...');

  const app = await NestFactory.createApplicationContext(SeedSettingsModule);
  const repo = app.get<Repository<Setting>>('SettingRepository');

  let created = 0;
  let skipped = 0;

  for (const item of SEED_DATA) {
    const existing = await repo
      .createQueryBuilder('setting')
      .where('setting.type = :type', { type: item.type })
      .andWhere('LOWER(setting.value) = LOWER(:value)', { value: item.value })
      .getOne();

    if (existing) {
      skipped++;
      continue;
    }

    await repo.save(
      repo.create({
        type: item.type,
        value: item.value,
        label: item.label,
        order: item.order,
        isActive: true,
      }),
    );
    created++;
  }

  console.log(`Settings seed complete: ${created} created, ${skipped} skipped.`);
  await app.close();
}

seedSettings();
