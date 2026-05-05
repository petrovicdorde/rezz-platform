import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Catch-up migration for entity columns that landed without their own
 * migration: minimum guest age + closed days on venues, guest ages on
 * reservations, password reset tokens + last reminder timestamp on users.
 * All statements use `IF NOT EXISTS` so re-running is harmless.
 */
export class AddPendingFeatureColumns1778025600000
  implements MigrationInterface
{
  name = 'AddPendingFeatureColumns1778025600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Venue: minimum guest age + closed days
    await queryRunner.query(
      `ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "minGuestAge" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "closedDays" jsonb NOT NULL DEFAULT '[]'::jsonb`,
    );

    // Reservation: guest ages (TypeORM simple-array → comma-separated text)
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "guestAges" text NULL`,
    );

    // User: password reset tokens + last reminder timestamp
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetToken" varchar NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetTokenExpiresAt" timestamptz NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastReservationReminderAt" timestamptz NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "lastReservationReminderAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordResetTokenExpiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordResetToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP COLUMN IF EXISTS "guestAges"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venues" DROP COLUMN IF EXISTS "closedDays"`,
    );
    await queryRunner.query(
      `ALTER TABLE "venues" DROP COLUMN IF EXISTS "minGuestAge"`,
    );
  }
}
