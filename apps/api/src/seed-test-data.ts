/* eslint-disable */
// Run: cd apps/api && npx ts-node src/seed-test-data.ts

import { DataSource } from 'typeorm';

const venueId = '0fb65d54-42f4-4f30-8b82-09d9ece50885';
const managerId = '5cac42f7-50a4-4a01-b5f0-ca50f69c4c15';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'rezz',
    password: 'rezz',
    database: 'rezz_db',
  });
  await ds.initialize();

  // Use raw queries with exact column names
  // reservations: id, venueId, venue_id, date, time, firstName, lastName, phone, numberOfGuests, tableType, specialRequest, status, source, createdByManagerId, created_by_manager_id, userId, user_id, arrivedAt, arrivalNote, cancelledAt, cancellationReason, createdAt, updatedAt

  const rCols = `(id, "venueId", venue_id, date, time, "firstName", "lastName", phone, "numberOfGuests", "tableType", "specialRequest", status, source, "createdByManagerId", created_by_manager_id, "userId", user_id, "arrivedAt", "arrivalNote", "cancelledAt", "cancellationReason", "createdAt", "updatedAt")`;

  // 3 PENDING reservations (from guests)
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a1000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-03-30','19:00','Marko','Petrović','+38766111222',4,'STANDARD','Proslava rođendana','PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
    ('a1000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-03-31','20:00','Ana','Jovanović','+38765222333',2,'BOOTH',NULL,'PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
    ('a1000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-04-01','21:30','Stefan','Nikolić','+38761333444',6,'VIP','Minimum potrošnja 200 KM','PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW())
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 3 PENDING reservations');

  // 3 Notifications
  const nCols = `(id, "userId", user_id, type, "isRead", "reservationId", reservation_id, metadata, "createdAt")`;
  await ds.query(`INSERT INTO notifications ${nCols} VALUES
    ('b1000001-0000-0000-0000-000000000001','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001','{"firstName":"Marko","lastName":"Petrović","date":"2026-03-30","time":"19:00","tableType":"STANDARD","numberOfGuests":4,"venueId":"${venueId}","phone":"+38766111222"}',NOW()-interval '10 minutes'),
    ('b1000001-0000-0000-0000-000000000002','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000002','a1000001-0000-0000-0000-000000000002','{"firstName":"Ana","lastName":"Jovanović","date":"2026-03-31","time":"20:00","tableType":"BOOTH","numberOfGuests":2,"venueId":"${venueId}","phone":"+38765222333"}',NOW()-interval '5 minutes'),
    ('b1000001-0000-0000-0000-000000000003','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000003','a1000001-0000-0000-0000-000000000003','{"firstName":"Stefan","lastName":"Nikolić","date":"2026-04-01","time":"21:30","tableType":"VIP","numberOfGuests":6,"venueId":"${venueId}","phone":"+38761333444"}',NOW()-interval '2 minutes')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 3 Notifications');

  // 3 Past reservations (history)
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a2000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-03-20','18:00','Jovana','Đurić','+38766555666',3,'TERRACE',NULL,'COMPLETED','MANAGER','${managerId}','${managerId}',NULL,NULL,'2026-03-20 18:15:00','Došli na vrijeme',NULL,NULL,'2026-03-19 10:00:00','2026-03-20 18:15:00'),
    ('a2000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-03-22','20:00','Nikola','Kovačević','+38765777888',2,'STANDARD','Alergija na gluten','NO_SHOW','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-21 14:00:00','2026-03-22 21:00:00'),
    ('a2000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-03-25','19:30','Milica','Stojanović','+38761999000',5,'HIGH_TABLE',NULL,'CANCELLED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-24 16:00:00','Promjena planova','2026-03-23 09:00:00','2026-03-24 16:00:00')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 3 Past reservations');

  // 3 Confirmed future reservations
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a3000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-03-29','19:00','Luka','Marković','+38766123456',4,'BOOTH','Poslovni ručak','CONFIRMED','MANAGER','${managerId}','${managerId}',NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '1 day',NOW()-interval '1 day'),
    ('a3000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-04-02','20:30','Teodora','Ilić','+38765654321',3,'TERRACE',NULL,'CONFIRMED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '2 days',NOW()-interval '2 days'),
    ('a3000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-04-05','21:00','Nemanja','Popović','+38761987654',8,'VIP','Dočekati sa šampanjcem','CONFIRMED','MANAGER','${managerId}','${managerId}',NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '3 days',NOW()-interval '3 days')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 3 Confirmed reservations');

  // 4 Events
  const eCols = `(id, name, description, "startsAt", "endsAt", "imageUrl", "isActive", address, "venueId", venue_id, "createdAt", "updatedAt")`;
  await ds.query(`INSERT INTO events ${eCols} VALUES
    ('e1000001-0000-0000-0000-000000000001','DJ Night - Subota','Najbolji DJ setovi uz odličnu atmosferu! Ulaz slobodan do 23h.','2026-04-04 22:00:00','2026-04-05 04:00:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e1000001-0000-0000-0000-000000000002','Wine & Dine Večer','Degustacija vina uz specijalni meni kuhara.','2026-04-10 19:00:00','2026-04-10 23:00:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e1000001-0000-0000-0000-000000000003','Live Band - Petak','Uživo nastup benda Zvuk Grada. Rezervišite stolove na vrijeme!','2026-04-11 21:00:00','2026-04-12 02:00:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e1000001-0000-0000-0000-000000000004','Karaoke Night','Svaki četvrtak karaoke veče! Najbolji pjevač osvaja poklon bon.','2026-04-03 20:00:00','2026-04-03 23:59:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW())
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 4 Events');

  // 6 Promotions
  const pCols = `(id, name, price, "imageUrl", "eventId", event_id, "createdAt")`;
  await ds.query(`INSERT INTO event_promotions ${pCols} VALUES
    ('c1000001-0000-0000-0000-000000000001','VIP Ulaz',20.00,NULL,'e1000001-0000-0000-0000-000000000001','e1000001-0000-0000-0000-000000000001',NOW()),
    ('c1000001-0000-0000-0000-000000000002','VIP Sto + Boca',100.00,NULL,'e1000001-0000-0000-0000-000000000001','e1000001-0000-0000-0000-000000000001',NOW()),
    ('c1000001-0000-0000-0000-000000000003','Degustacioni meni',45.00,NULL,'e1000001-0000-0000-0000-000000000002','e1000001-0000-0000-0000-000000000002',NOW()),
    ('c1000001-0000-0000-0000-000000000004','Meni + vina',75.00,NULL,'e1000001-0000-0000-0000-000000000002','e1000001-0000-0000-0000-000000000002',NOW()),
    ('c1000001-0000-0000-0000-000000000005','Rezervacija stola',15.00,NULL,'e1000001-0000-0000-0000-000000000003','e1000001-0000-0000-0000-000000000003',NOW()),
    ('c1000001-0000-0000-0000-000000000006','Poklon bon',30.00,NULL,'e1000001-0000-0000-0000-000000000004','e1000001-0000-0000-0000-000000000004',NOW())
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 6 Promotions');

  console.log('\n🎉 All test data seeded!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
