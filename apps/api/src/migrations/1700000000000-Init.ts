import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline schema for a fresh database. Creates every table the app expects
 * based on the current entity definitions. Every statement is guarded so this
 * migration is safe to re-run on an already-bootstrapped database (it then
 * acts as a no-op).
 *
 * The `event_id` FK on `reservations` is intentionally NOT created here —
 * the 1776585600000-AddEventIdToReservations migration adds it via an
 * unguarded ADD CONSTRAINT, which would conflict if we created it both
 * places.
 */
export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // --- enum types ---
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_role_enum" AS ENUM ('SUPER_ADMIN','MANAGER','WORKER','GUEST');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "venue_invitations_role_enum" AS ENUM ('MANAGER','WORKER');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "venue_invitations_status_enum" AS ENUM ('PENDING','ACCEPTED','DECLINED','EXPIRED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "reservations_status_enum" AS ENUM ('PENDING','CONFIRMED','REJECTED','CANCELLED','COMPLETED','NO_SHOW');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "reservations_source_enum" AS ENUM ('GUEST_APP','MANAGER');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // --- users ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firstName" varchar NOT NULL,
        "lastName" varchar NOT NULL,
        "email" varchar NOT NULL,
        "passwordHash" varchar,
        "role" "users_role_enum" NOT NULL DEFAULT 'GUEST',
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "emailVerificationToken" varchar,
        "emailVerificationTokenExpiresAt" timestamptz,
        "passwordResetToken" varchar,
        "passwordResetTokenExpiresAt" timestamptz,
        "phone" varchar,
        "googleId" varchar,
        "refreshTokenHash" varchar,
        "invitationToken" varchar,
        "invitationTokenExpiresAt" timestamptz,
        "venueId" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "isBlacklisted" boolean NOT NULL DEFAULT false,
        "blacklistedAt" timestamptz,
        "blacklistReason" text,
        "lastReservationReminderAt" timestamptz,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // --- settings ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" varchar NOT NULL,
        "value" varchar NOT NULL,
        "label" varchar NOT NULL,
        "labelEn" varchar NOT NULL DEFAULT '',
        "isActive" boolean NOT NULL DEFAULT true,
        "order" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_settings_type_value" UNIQUE ("type","value")
      )
    `);

    // --- landing_config ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "landing_config" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "featuredVenueIds" text NOT NULL DEFAULT '',
        "featuredEventIds" text NOT NULL DEFAULT '',
        "showFeaturedVenues" boolean NOT NULL DEFAULT true,
        "showFeaturedEvents" boolean NOT NULL DEFAULT false,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_landing_config" PRIMARY KEY ("id")
      )
    `);

    // --- venues ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "venues" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "type" varchar NOT NULL,
        "reservationPhone" varchar NOT NULL,
        "reservationEmail" varchar,
        "workingHours" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "paymentMethods" text NOT NULL DEFAULT '',
        "hasParking" boolean NOT NULL DEFAULT false,
        "tags" text NOT NULL DEFAULT '',
        "isActive" boolean NOT NULL DEFAULT true,
        "city" varchar NOT NULL,
        "address" varchar NOT NULL,
        "imageUrl" varchar,
        "description" text,
        "socialLinks" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "minGuestAge" integer,
        "closedDays" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_venues" PRIMARY KEY ("id")
      )
    `);

    // --- venue_tables ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "venue_tables" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" varchar NOT NULL,
        "count" integer NOT NULL,
        "note" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "venue_id" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_venue_tables" PRIMARY KEY ("id"),
        CONSTRAINT "FK_venue_tables_venue"
          FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE
      )
    `);

    // --- venue_invitations ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "venue_invitations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL,
        "phone" varchar,
        "firstName" varchar,
        "lastName" varchar,
        "role" "venue_invitations_role_enum" NOT NULL,
        "status" "venue_invitations_status_enum" NOT NULL DEFAULT 'PENDING',
        "token" varchar NOT NULL,
        "tokenExpiresAt" timestamptz NOT NULL,
        "venue_id" uuid NOT NULL,
        "acceptedAt" timestamptz,
        "declinedAt" timestamptz,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_venue_invitations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_venue_invitations_token" UNIQUE ("token"),
        CONSTRAINT "FK_venue_invitations_venue"
          FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE
      )
    `);

    // --- events ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text,
        "startsAt" TIMESTAMP NOT NULL,
        "endsAt" timestamptz,
        "imageUrl" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "address" varchar NOT NULL,
        "venue_id" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_events_venue"
          FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE
      )
    `);

    // --- event_promotions ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "event_promotions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "imageUrl" varchar,
        "event_id" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_promotions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_event_promotions_event"
          FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE
      )
    `);

    // --- reservations (event_id FK is added by the later migration) ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reservations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "venue_id" uuid NOT NULL,
        "date" date NOT NULL,
        "time" time NOT NULL,
        "firstName" varchar NOT NULL,
        "lastName" varchar NOT NULL,
        "phone" varchar NOT NULL,
        "numberOfGuests" integer NOT NULL,
        "tableType" varchar NOT NULL,
        "specialRequest" text,
        "guestAges" text,
        "status" "reservations_status_enum" NOT NULL DEFAULT 'PENDING',
        "source" "reservations_source_enum" NOT NULL DEFAULT 'GUEST_APP',
        "created_by_manager_id" uuid,
        "user_id" uuid,
        "event_id" uuid,
        "arrivedAt" timestamptz,
        "arrivalNote" text,
        "cancelledAt" timestamptz,
        "cancellationReason" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reservations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reservations_venue"
          FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reservations_created_by_manager"
          FOREIGN KEY ("created_by_manager_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_reservations_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // --- guest_ratings ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "guest_ratings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "rating" integer NOT NULL,
        "note" text,
        "reservation_id" uuid NOT NULL,
        "guest_user_id" uuid,
        "rated_by_id" uuid NOT NULL,
        "venueId" varchar NOT NULL,
        "isAutomatic" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_guest_ratings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_guest_ratings_reservation" UNIQUE ("reservation_id"),
        CONSTRAINT "FK_guest_ratings_reservation"
          FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_guest_ratings_guest_user"
          FOREIGN KEY ("guest_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_guest_ratings_rated_by"
          FOREIGN KEY ("rated_by_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // --- notifications ---
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" varchar NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "reservation_id" uuid,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_notifications_reservation"
          FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "guest_ratings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reservations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_promotions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "venue_invitations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "venue_tables"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "venues"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "landing_config"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reservations_source_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reservations_status_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "venue_invitations_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "venue_invitations_role_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
  }
}
