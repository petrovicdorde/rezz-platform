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

  const rCols = `(id, "venueId", venue_id, date, time, "firstName", "lastName", phone, "numberOfGuests", "tableType", "specialRequest", status, source, "createdByManagerId", created_by_manager_id, "userId", user_id, "arrivedAt", "arrivalNote", "cancelledAt", "cancellationReason", "createdAt", "updatedAt")`;

  // PENDING
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a1000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-04-03','19:00','Marko','Petrović','+38766111222',4,'STANDARD','Proslava rođendana','PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
    ('a1000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-04-03','20:00','Ana','Jovanović','+38765222333',2,'BOOTH',NULL,'PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
    ('a1000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-04-04','21:30','Stefan','Nikolić','+38761333444',6,'VIP','Minimum potrošnja 200 KM','PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
    ('a1000001-0000-0000-0000-000000000004','${venueId}','${venueId}','2026-04-04','18:00','Jelena','Mihajlović','+38766444555',3,'TERRACE',NULL,'PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
    ('a1000001-0000-0000-0000-000000000005','${venueId}','${venueId}','2026-04-05','20:00','Dragan','Vasić','+38765555666',5,'STANDARD','Poslovni ručak','PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW()),
    ('a1000001-0000-0000-0000-000000000006','${venueId}','${venueId}','2026-04-06','19:30','Milena','Đorđević','+38761666777',2,'BOOTH',NULL,'PENDING','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW(),NOW())
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 6 PENDING reservations');

  // CONFIRMED future
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a3000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-04-03','19:00','Luka','Marković','+38766123456',4,'BOOTH','Poslovni ručak','CONFIRMED','MANAGER','${managerId}','${managerId}',NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '1 day',NOW()-interval '1 day'),
    ('a3000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-04-04','20:30','Teodora','Ilić','+38765654321',3,'TERRACE',NULL,'CONFIRMED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '2 days',NOW()-interval '2 days'),
    ('a3000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-04-05','21:00','Nemanja','Popović','+38761987654',8,'VIP','Dočekati sa šampanjcem','CONFIRMED','MANAGER','${managerId}','${managerId}',NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '3 days',NOW()-interval '3 days'),
    ('a3000001-0000-0000-0000-000000000004','${venueId}','${venueId}','2026-04-06','18:30','Katarina','Đukić','+38766321987',2,'STANDARD',NULL,'CONFIRMED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '4 days',NOW()-interval '4 days'),
    ('a3000001-0000-0000-0000-000000000005','${venueId}','${venueId}','2026-04-07','20:00','Aleksandar','Lazić','+38765789012',6,'BOOTH','Godišnjica braka','CONFIRMED','MANAGER','${managerId}','${managerId}',NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '5 days',NOW()-interval '5 days'),
    ('a3000001-0000-0000-0000-000000000006','${venueId}','${venueId}','2026-04-09','19:00','Ivana','Stanković','+38761234567',4,'VIP',NULL,'CONFIRMED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NOW()-interval '6 days',NOW()-interval '6 days')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 6 CONFIRMED future reservations');

  // COMPLETED past
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a2000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-03-28','18:00','Jovana','Đurić','+38766555666',3,'TERRACE',NULL,'COMPLETED','MANAGER','${managerId}','${managerId}',NULL,NULL,'2026-03-28 18:15:00','Došli na vrijeme',NULL,NULL,'2026-03-27 10:00:00','2026-03-28 18:15:00'),
    ('a2000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-03-29','20:00','Bojan','Ristić','+38765888999',4,'STANDARD','Proslava','COMPLETED','GUEST_APP',NULL,NULL,NULL,NULL,'2026-03-29 20:10:00','Punktualni gosti',NULL,NULL,'2026-03-28 14:00:00','2026-03-29 20:10:00'),
    ('a2000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-03-30','19:30','Sanja','Tošić','+38761777888',2,'BOOTH',NULL,'COMPLETED','MANAGER','${managerId}','${managerId}',NULL,NULL,'2026-03-30 19:45:00',NULL,NULL,NULL,'2026-03-29 09:00:00','2026-03-30 19:45:00'),
    ('a2000001-0000-0000-0000-000000000004','${venueId}','${venueId}','2026-03-31','20:30','Darko','Milić','+38766999000',6,'VIP','Korporativna večera','COMPLETED','GUEST_APP',NULL,NULL,NULL,NULL,'2026-03-31 20:35:00','VIP gosti odlični',NULL,NULL,'2026-03-30 11:00:00','2026-03-31 20:35:00'),
    ('a2000001-0000-0000-0000-000000000005','${venueId}','${venueId}','2026-04-01','21:00','Nina','Obradović','+38765000111',3,'STANDARD',NULL,'COMPLETED','MANAGER','${managerId}','${managerId}',NULL,NULL,'2026-04-01 21:05:00','Stigli na vrijeme',NULL,NULL,'2026-03-31 15:00:00','2026-04-01 21:05:00'),
    ('a2000001-0000-0000-0000-000000000006','${venueId}','${venueId}','2026-04-02','19:00','Miloš','Savić','+38761111222',5,'TERRACE','Djevojačko veče','COMPLETED','GUEST_APP',NULL,NULL,NULL,NULL,'2026-04-02 19:10:00',NULL,NULL,NULL,'2026-04-01 10:00:00','2026-04-02 19:10:00')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 6 COMPLETED past reservations');

  // NO_SHOW — key fix: NULL instead of empty string for cancelledAt
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a4000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-03-25','19:00','Nikola','Kovačević','+38765777888',2,'STANDARD','Alergija na gluten','NO_SHOW','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-24 14:00:00','2026-03-25 21:00:00'),
    ('a4000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-03-26','20:00','Maja','Knežević','+38766888999',4,'BOOTH',NULL,'NO_SHOW','GUEST_APP',NULL,NULL,NULL,NULL,NULL,'Nisu se javili',NULL,NULL,'2026-03-25 12:00:00','2026-03-26 22:00:00'),
    ('a4000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-03-27','21:00','Igor','Filipović','+38761999000',3,'VIP','VIP sto','NO_SHOW','MANAGER','${managerId}','${managerId}',NULL,NULL,NULL,'Gost nije kontaktirao',NULL,NULL,'2026-03-26 09:00:00','2026-03-27 23:00:00')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 3 NO_SHOW past reservations');

  // CANCELLED
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a5000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-03-22','19:30','Milica','Stojanović','+38761999000',5,'HIGH_TABLE',NULL,'CANCELLED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-21 16:00:00','Promjena planova','2026-03-20 09:00:00','2026-03-21 16:00:00'),
    ('a5000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-03-24','20:00','Petar','Đukić','+38766222333',3,'STANDARD',NULL,'CANCELLED','MANAGER','${managerId}','${managerId}',NULL,NULL,NULL,NULL,'2026-03-23 10:00:00','Lokal zatvoren taj dan','2026-03-22 11:00:00','2026-03-23 10:00:00'),
    ('a5000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-03-26','18:00','Tanja','Vuković','+38765333444',2,'BOOTH','Rodendan','CANCELLED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-25 14:00:00','Bolest','2026-03-24 16:00:00','2026-03-25 14:00:00'),
    ('a5000001-0000-0000-0000-000000000004','${venueId}','${venueId}','2026-03-28','21:00','Zoran','Lukić','+38761444555',6,'VIP','Poslovni partner','CANCELLED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-27 09:00:00','Otkazano zbog posla','2026-03-26 12:00:00','2026-03-27 09:00:00')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 4 CANCELLED past reservations');

  // REJECTED
  await ds.query(`INSERT INTO reservations ${rCols} VALUES
    ('a6000001-0000-0000-0000-000000000001','${venueId}','${venueId}','2026-03-23','20:00','Vesna','Pejović','+38766444555',10,'STANDARD','Grupna proslava','REJECTED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-22 10:00:00','Nema kapaciteta za 10 osoba','2026-03-21 15:00:00','2026-03-22 10:00:00'),
    ('a6000001-0000-0000-0000-000000000002','${venueId}','${venueId}','2026-03-25','21:30','Rade','Simić','+38765555666',4,'VIP',NULL,'REJECTED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-24 12:00:00','VIP sto rezervisan','2026-03-23 10:00:00','2026-03-24 12:00:00'),
    ('a6000001-0000-0000-0000-000000000003','${venueId}','${venueId}','2026-03-27','19:00','Biljana','Todorović','+38761666777',3,'TERRACE',NULL,'REJECTED','GUEST_APP',NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-26 11:00:00','Terasa zatvorena','2026-03-25 14:00:00','2026-03-26 11:00:00')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 3 REJECTED past reservations');

  // NOTIFICATIONS
  const nCols = `(id, "userId", user_id, type, "isRead", "reservationId", reservation_id, metadata, "createdAt")`;
  await ds.query(`INSERT INTO notifications ${nCols} VALUES
    ('b1000001-0000-0000-0000-000000000001','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000001','a1000001-0000-0000-0000-000000000001','{"firstName":"Marko","lastName":"Petrović","date":"2026-04-03","time":"19:00","tableType":"STANDARD","numberOfGuests":4,"venueId":"${venueId}","phone":"+38766111222"}',NOW()-interval '30 minutes'),
    ('b1000001-0000-0000-0000-000000000002','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000002','a1000001-0000-0000-0000-000000000002','{"firstName":"Ana","lastName":"Jovanović","date":"2026-04-03","time":"20:00","tableType":"BOOTH","numberOfGuests":2,"venueId":"${venueId}","phone":"+38765222333"}',NOW()-interval '25 minutes'),
    ('b1000001-0000-0000-0000-000000000003','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000003','a1000001-0000-0000-0000-000000000003','{"firstName":"Stefan","lastName":"Nikolić","date":"2026-04-04","time":"21:30","tableType":"VIP","numberOfGuests":6,"venueId":"${venueId}","phone":"+38761333444"}',NOW()-interval '20 minutes'),
    ('b1000001-0000-0000-0000-000000000004','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000004','a1000001-0000-0000-0000-000000000004','{"firstName":"Jelena","lastName":"Mihajlović","date":"2026-04-04","time":"18:00","tableType":"TERRACE","numberOfGuests":3,"venueId":"${venueId}","phone":"+38766444555"}',NOW()-interval '15 minutes'),
    ('b1000001-0000-0000-0000-000000000005','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000005','a1000001-0000-0000-0000-000000000005','{"firstName":"Dragan","lastName":"Vasić","date":"2026-04-05","time":"20:00","tableType":"STANDARD","numberOfGuests":5,"venueId":"${venueId}","phone":"+38765555666"}',NOW()-interval '10 minutes'),
    ('b1000001-0000-0000-0000-000000000006','${managerId}','${managerId}','RESERVATION_NEW',false,'a1000001-0000-0000-0000-000000000006','a1000001-0000-0000-0000-000000000006','{"firstName":"Milena","lastName":"Đorđević","date":"2026-04-06","time":"19:30","tableType":"BOOTH","numberOfGuests":2,"venueId":"${venueId}","phone":"+38761666777"}',NOW()-interval '5 minutes'),
    ('b2000001-0000-0000-0000-000000000001','${managerId}','${managerId}','RESERVATION_CANCELLED',true,'a5000001-0000-0000-0000-000000000001','a5000001-0000-0000-0000-000000000001','{"firstName":"Milica","lastName":"Stojanović","date":"2026-03-22","time":"19:30","tableType":"HIGH_TABLE","numberOfGuests":5,"venueId":"${venueId}"}','2026-03-21 16:00:00'),
    ('b2000001-0000-0000-0000-000000000002','${managerId}','${managerId}','RESERVATION_CANCELLED',true,'a5000001-0000-0000-0000-000000000003','a5000001-0000-0000-0000-000000000003','{"firstName":"Tanja","lastName":"Vuković","date":"2026-03-26","time":"18:00","tableType":"BOOTH","numberOfGuests":2,"venueId":"${venueId}"}','2026-03-25 14:00:00')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 8 Notifications (6 unread, 2 read)');

  // EVENTS
  const eCols = `(id, name, description, "startsAt", "endsAt", "imageUrl", "isActive", address, "venueId", venue_id, "createdAt", "updatedAt")`;
  await ds.query(`INSERT INTO events ${eCols} VALUES
    ('e1000001-0000-0000-0000-000000000001','DJ Night - Subota','Najbolji DJ setovi uz odličnu atmosferu! Ulaz slobodan do 23h.','2026-04-04 22:00:00','2026-04-05 04:00:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e1000001-0000-0000-0000-000000000002','Wine & Dine Večer','Ekskluzivna degustacija vina uz specijalni meni kuhara. Ograničen broj mjesta!','2026-04-10 19:00:00','2026-04-10 23:00:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e1000001-0000-0000-0000-000000000003','Live Band - Zvuk Grada','Uživo nastup benda Zvuk Grada. Rezervišite stolove na vrijeme!','2026-04-11 21:00:00','2026-04-12 02:00:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e1000001-0000-0000-0000-000000000004','Karaoke Night','Svaki četvrtak karaoke veče! Najbolji pjevač osvaja poklon bon od 50 KM.','2026-04-03 20:00:00','2026-04-03 23:59:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e1000001-0000-0000-0000-000000000005','Uskršnja večera','Poseban Uskršnji meni sa tradicionalnim jelima. Rezervacije obavezne!','2026-04-19 13:00:00','2026-04-19 22:00:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e1000001-0000-0000-0000-000000000006','Ladies Night','Specijalna večer za dame! Pića po posebnim cijenama, live DJ i tombola.','2026-04-17 21:00:00','2026-04-18 03:00:00',NULL,true,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}',NOW(),NOW()),
    ('e2000001-0000-0000-0000-000000000001','St. Patricks Night','Proslavili smo irski dan uz Guinness i irsku muziku!','2026-03-17 20:00:00','2026-03-18 02:00:00',NULL,false,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}','2026-03-15 10:00:00','2026-03-18 03:00:00'),
    ('e2000001-0000-0000-0000-000000000002','Jazz Evening','Prelijepo veče uz jazz trio. Hvala svima na posjeti!','2026-03-20 20:00:00','2026-03-20 23:00:00',NULL,false,'Bulevar Desanke Maksimović 10, Banja Luka','${venueId}','${venueId}','2026-03-18 10:00:00','2026-03-21 00:00:00')
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 8 Events (6 upcoming, 2 past)');

  // PROMOTIONS
  const pCols = `(id, name, price, "imageUrl", "eventId", event_id, "createdAt")`;
  await ds.query(`INSERT INTO event_promotions ${pCols} VALUES
    ('c1000001-0000-0000-0000-000000000001','VIP Ulaz',20.00,NULL,'e1000001-0000-0000-0000-000000000001','e1000001-0000-0000-0000-000000000001',NOW()),
    ('c1000001-0000-0000-0000-000000000002','VIP Sto + Boca',150.00,NULL,'e1000001-0000-0000-0000-000000000001','e1000001-0000-0000-0000-000000000001',NOW()),
    ('c1000001-0000-0000-0000-000000000003','Regular Ulaz',10.00,NULL,'e1000001-0000-0000-0000-000000000001','e1000001-0000-0000-0000-000000000001',NOW()),
    ('c1000001-0000-0000-0000-000000000004','Degustacioni meni',45.00,NULL,'e1000001-0000-0000-0000-000000000002','e1000001-0000-0000-0000-000000000002',NOW()),
    ('c1000001-0000-0000-0000-000000000005','Meni + premium vina',85.00,NULL,'e1000001-0000-0000-0000-000000000002','e1000001-0000-0000-0000-000000000002',NOW()),
    ('c1000001-0000-0000-0000-000000000006','Rezervacija stola',15.00,NULL,'e1000001-0000-0000-0000-000000000003','e1000001-0000-0000-0000-000000000003',NOW()),
    ('c1000001-0000-0000-0000-000000000007','VIP Sto + 2 boce',200.00,NULL,'e1000001-0000-0000-0000-000000000003','e1000001-0000-0000-0000-000000000003',NOW()),
    ('c1000001-0000-0000-0000-000000000008','Poklon bon 50 KM',50.00,NULL,'e1000001-0000-0000-0000-000000000004','e1000001-0000-0000-0000-000000000004',NOW()),
    ('c1000001-0000-0000-0000-000000000009','Uskršnji meni',35.00,NULL,'e1000001-0000-0000-0000-000000000005','e1000001-0000-0000-0000-000000000005',NOW()),
    ('c1000001-0000-0000-0000-000000000010','Uskršnji meni + vino',55.00,NULL,'e1000001-0000-0000-0000-000000000005','e1000001-0000-0000-0000-000000000005',NOW()),
    ('c1000001-0000-0000-0000-000000000011','Djeca do 12 god',15.00,NULL,'e1000001-0000-0000-0000-000000000005','e1000001-0000-0000-0000-000000000005',NOW()),
    ('c1000001-0000-0000-0000-000000000012','Ladies ulaz + koktel',25.00,NULL,'e1000001-0000-0000-0000-000000000006','e1000001-0000-0000-0000-000000000006',NOW()),
    ('c1000001-0000-0000-0000-000000000013','VIP Sto + boca prosecca',120.00,NULL,'e1000001-0000-0000-0000-000000000006','e1000001-0000-0000-0000-000000000006',NOW())
  ON CONFLICT (id) DO NOTHING`);
  console.log('✅ 13 Promotions');

  console.log('\n🎉 All test data seeded successfully!');
  console.log('📊 Summary:');
  console.log('   - 6 PENDING (danas i narednih dana)');
  console.log('   - 6 CONFIRMED (predstojeće)');
  console.log('   - 6 COMPLETED (prošle, mogu se ocijeniti)');
  console.log('   - 3 NO_SHOW');
  console.log('   - 4 CANCELLED');
  console.log('   - 3 REJECTED');
  console.log('   - 8 Notifications (6 unread, 2 read)');
  console.log('   - 8 Events (6 upcoming, 2 past)');
  console.log('   - 13 Promotions');

  await ds.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
