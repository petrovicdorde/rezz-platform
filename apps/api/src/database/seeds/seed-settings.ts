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
  labelEn: string;
  order: number;
}

const SEED_DATA: SeedItem[] = [
  // Cities
  { type: 'CITY', value: 'BANJA_LUKA', label: 'Banja Luka', labelEn: 'Banja Luka', order: 1 },
  { type: 'CITY', value: 'SARAJEVO', label: 'Sarajevo', labelEn: 'Sarajevo', order: 2 },
  { type: 'CITY', value: 'MOSTAR', label: 'Mostar', labelEn: 'Mostar', order: 3 },
  { type: 'CITY', value: 'TUZLA', label: 'Tuzla', labelEn: 'Tuzla', order: 4 },
  { type: 'CITY', value: 'ZENICA', label: 'Zenica', labelEn: 'Zenica', order: 5 },
  { type: 'CITY', value: 'BIJELJINA', label: 'Bijeljina', labelEn: 'Bijeljina', order: 6 },
  { type: 'CITY', value: 'PRIJEDOR', label: 'Prijedor', labelEn: 'Prijedor', order: 7 },
  { type: 'CITY', value: 'TREBINJE', label: 'Trebinje', labelEn: 'Trebinje', order: 8 },
  { type: 'CITY', value: 'DOBOJ', label: 'Doboj', labelEn: 'Doboj', order: 9 },
  { type: 'CITY', value: 'BRCKO', label: 'Brčko', labelEn: 'Brčko', order: 10 },

  // Venue types
  { type: 'VENUE_TYPE', value: 'RESTAURANT', label: 'Restoran', labelEn: 'Restaurant', order: 1 },
  { type: 'VENUE_TYPE', value: 'CAFE', label: 'Kafić', labelEn: 'Cafe', order: 2 },
  { type: 'VENUE_TYPE', value: 'CAFFE_BAR', label: 'Caffe bar', labelEn: 'Caffe bar', order: 3 },
  { type: 'VENUE_TYPE', value: 'LOUNGE', label: 'Lounge', labelEn: 'Lounge', order: 4 },
  { type: 'VENUE_TYPE', value: 'CLUB', label: 'Klub', labelEn: 'Club', order: 5 },
  { type: 'VENUE_TYPE', value: 'FAST_FOOD', label: 'Fast food', labelEn: 'Fast food', order: 6 },
  { type: 'VENUE_TYPE', value: 'PIZZERIA', label: 'Pizzeria', labelEn: 'Pizzeria', order: 7 },
  { type: 'VENUE_TYPE', value: 'ROOFTOP', label: 'Rooftop bar', labelEn: 'Rooftop bar', order: 8 },
  { type: 'VENUE_TYPE', value: 'SPORTS_BAR', label: 'Sports bar', labelEn: 'Sports bar', order: 9 },
  { type: 'VENUE_TYPE', value: 'WINE_BAR', label: 'Wine bar', labelEn: 'Wine bar', order: 10 },
  { type: 'VENUE_TYPE', value: 'HOOKAH_LOUNGE', label: 'Nargilana', labelEn: 'Hookah lounge', order: 11 },
  { type: 'VENUE_TYPE', value: 'BAKERY', label: 'Pekara', labelEn: 'Bakery', order: 12 },

  // Table types
  { type: 'TABLE_TYPE', value: 'STANDARD', label: 'Standardni sto', labelEn: 'Standard table', order: 1 },
  { type: 'TABLE_TYPE', value: 'BOOTH', label: 'Separe', labelEn: 'Booth', order: 2 },
  { type: 'TABLE_TYPE', value: 'BAR_SEAT', label: 'Sank', labelEn: 'Bar seat', order: 3 },
  { type: 'TABLE_TYPE', value: 'LOW_TABLE', label: 'Niski sto', labelEn: 'Low table', order: 4 },
  { type: 'TABLE_TYPE', value: 'HIGH_TABLE', label: 'Visoki sto', labelEn: 'High table', order: 5 },
  { type: 'TABLE_TYPE', value: 'TERRACE', label: 'Terasa', labelEn: 'Terrace', order: 6 },
  { type: 'TABLE_TYPE', value: 'VIP', label: 'VIP', labelEn: 'VIP', order: 7 },
];

async function seedSettings(): Promise<void> {
  console.log('Seeding settings...');

  const app = await NestFactory.createApplicationContext(SeedSettingsModule);
  const repo = app.get<Repository<Setting>>('SettingRepository');

  let created = 0;
  let skipped = 0;
  let updated = 0;

  for (const item of SEED_DATA) {
    const existing = await repo
      .createQueryBuilder('setting')
      .where('setting.type = :type', { type: item.type })
      .andWhere('LOWER(setting.value) = LOWER(:value)', { value: item.value })
      .getOne();

    if (existing) {
      if (!existing.labelEn || existing.labelEn.trim() === '') {
        existing.labelEn = item.labelEn;
        await repo.save(existing);
        updated++;
      } else {
        skipped++;
      }
      continue;
    }

    await repo.save(
      repo.create({
        type: item.type,
        value: item.value,
        label: item.label,
        labelEn: item.labelEn,
        order: item.order,
        isActive: true,
      }),
    );
    created++;
  }

  console.log(
    `Settings seed complete: ${created} created, ${updated} labelEn backfilled, ${skipped} skipped.`,
  );
  await app.close();
}

seedSettings();
