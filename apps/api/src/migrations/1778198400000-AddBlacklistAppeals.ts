import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlacklistAppeals1778198400000 implements MigrationInterface {
  name = 'AddBlacklistAppeals1778198400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "blacklist_appeals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "message" text NOT NULL,
        "status" varchar NOT NULL DEFAULT 'PENDING',
        "adminNote" text NULL,
        "decided_by_admin_id" uuid NULL,
        "submittedAt" timestamptz NOT NULL DEFAULT now(),
        "decidedAt" timestamptz NULL,
        CONSTRAINT "PK_blacklist_appeals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_blacklist_appeals_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_blacklist_appeals_admin"
          FOREIGN KEY ("decided_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_blacklist_appeals_user_id"
        ON "blacklist_appeals" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_blacklist_appeals_status"
        ON "blacklist_appeals" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_blacklist_appeals_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_blacklist_appeals_user_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "blacklist_appeals"`);
  }
}
