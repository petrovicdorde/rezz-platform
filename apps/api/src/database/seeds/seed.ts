import 'reflect-metadata';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import { User, UserRole } from '../../users/entities/user.entity';

void ConfigModule.forRoot({ isGlobal: true });

async function seed(): Promise<void> {
  console.log('Seeding SUPER_ADMIN...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
    synchronize: false,
  });

  await dataSource.initialize();
  await seedSuperAdmin(dataSource);
  await dataSource.destroy();
}

async function seedSuperAdmin(dataSource: DataSource): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL ?? 'admin@rezz.ba';
  const password = process.env.SUPER_ADMIN_PASSWORD ?? 'Admin123!';
  const repo = dataSource.getRepository(User);

  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    console.log('SUPER_ADMIN already exists, skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await repo.insert({
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

void seed();
