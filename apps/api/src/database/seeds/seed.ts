import 'reflect-metadata';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import { User, UserRole } from '../../users/entities/user.entity';

void ConfigModule.forRoot({ isGlobal: true });

async function seed() {
  console.log('Seeding database...');

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
    synchronize: true,
  });

  await dataSource.initialize();

  await seedSuperAdmin(dataSource);
  await seedTestReservations(dataSource);

  await dataSource.destroy();
}

async function seedSuperAdmin(dataSource: DataSource) {
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

async function seedTestReservations(dataSource: DataSource) {
  const venueId = '0fb65d54-42f4-4f30-8b82-09d9ece50885';

  const venueExists = await dataSource.query<{ id: string }[]>(
    'SELECT id FROM venues WHERE id = $1 LIMIT 1',
    [venueId],
  );
  if (venueExists.length === 0) {
    console.log(`Venue ${venueId} not found, skipping reservations seed.`);
    return;
  }

  // Clean up previously broken seed inserts (venue_id NULL on this venue's "venueId").
  await dataSource.query(
    `DELETE FROM reservations WHERE "venueId" = $1 AND venue_id IS NULL`,
    [venueId],
  );

  const managerRows = await dataSource.query<{ id: string }[]>(
    `SELECT id FROM users WHERE "venueId" = $1 AND role = 'MANAGER' LIMIT 1`,
    [venueId],
  );
  const managerId = managerRows[0]?.id ?? null;

  const pad = (n: number) => String(n).padStart(2, '0');
  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const addDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const tomorrow = addDays(1);
  const thisWeekA = addDays(3);
  const thisWeekB = addDays(4);
  const nextWeekA = addDays(8);
  const nextWeekB = addDays(10);

  const rows = [
    {
      date: toDateStr(tomorrow),
      time: '19:00:00',
      firstName: 'Marko',
      lastName: 'Petrovic',
      phone: '+38761111222',
      numberOfGuests: 2,
      tableType: 'STANDARD',
      specialRequest: null as string | null,
      status: 'CONFIRMED',
      source: 'GUEST_APP',
    },
    {
      date: toDateStr(tomorrow),
      time: '20:30:00',
      firstName: 'Jovana',
      lastName: 'Nikolic',
      phone: '+38761333444',
      numberOfGuests: 4,
      tableType: 'BOOTH',
      specialRequest: 'Sto pored prozora',
      status: 'PENDING',
      source: 'GUEST_APP',
    },
    {
      date: toDateStr(thisWeekA),
      time: '18:00:00',
      firstName: 'Stefan',
      lastName: 'Jovanovic',
      phone: '+38761555666',
      numberOfGuests: 3,
      tableType: 'TERRACE',
      specialRequest: null,
      status: 'CONFIRMED',
      source: 'MANAGER',
    },
    {
      date: toDateStr(thisWeekB),
      time: '21:00:00',
      firstName: 'Ana',
      lastName: 'Markovic',
      phone: '+38761777888',
      numberOfGuests: 6,
      tableType: 'VIP',
      specialRequest: 'Rodjendan, donijeti tortu',
      status: 'PENDING',
      source: 'GUEST_APP',
    },
    {
      date: toDateStr(nextWeekA),
      time: '19:30:00',
      firstName: 'Nikola',
      lastName: 'Djuric',
      phone: '+38761999000',
      numberOfGuests: 2,
      tableType: 'HIGH_TABLE',
      specialRequest: null,
      status: 'CONFIRMED',
      source: 'GUEST_APP',
    },
    {
      date: toDateStr(nextWeekB),
      time: '20:00:00',
      firstName: 'Tijana',
      lastName: 'Kovacevic',
      phone: '+38762111333',
      numberOfGuests: 5,
      tableType: 'BOOTH',
      specialRequest: 'Poslovna vecera',
      status: 'CONFIRMED',
      source: 'MANAGER',
    },
  ];

  const insertedIds: {
    id: string;
    firstName: string;
    lastName: string;
    date: string;
    time: string;
    status: string;
  }[] = [];
  for (const r of rows) {
    const result = await dataSource.query<{ id: string }[]>(
      `INSERT INTO reservations
       ("venueId", venue_id, date, time, "firstName", "lastName", phone,
        "numberOfGuests", "tableType", "specialRequest", status, source)
       VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        venueId,
        venueId,
        r.date,
        r.time,
        r.firstName,
        r.lastName,
        r.phone,
        r.numberOfGuests,
        r.tableType,
        r.specialRequest,
        r.status,
        r.source,
      ],
    );
    insertedIds.push({ id: result[0].id, ...r });
  }
  console.log(
    `Inserted ${insertedIds.length} test reservations for venue ${venueId}`,
  );

  if (!managerId) {
    console.log('No MANAGER user found for venue, skipping notifications.');
    return;
  }

  for (const r of insertedIds) {
    const type =
      r.status === 'PENDING' ? 'RESERVATION_NEW' : 'RESERVATION_CONFIRMED';
    await dataSource.query(
      `INSERT INTO notifications ("userId", user_id, type, "isRead", "reservationId", reservation_id, metadata)
       VALUES ($1, $2::uuid, $3, false, $4, $5::uuid, $6::jsonb)`,
      [
        managerId,
        managerId,
        type,
        r.id,
        r.id,
        JSON.stringify({
          firstName: r.firstName,
          lastName: r.lastName,
          date: r.date,
          time: r.time,
          venueId,
        }),
      ],
    );
  }
  console.log(
    `Inserted ${insertedIds.length} notifications for manager ${managerId}`,
  );
}

void seed();
