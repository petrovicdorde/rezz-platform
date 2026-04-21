import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertTypeEnumsToVarchar1776502800000 implements MigrationInterface {
  name = 'ConvertTypeEnumsToVarchar1776502800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venues" ALTER COLUMN "type" TYPE varchar USING "type"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "venue_tables" ALTER COLUMN "type" TYPE varchar USING "type"::text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ALTER COLUMN "tableType" TYPE varchar USING "tableType"::text`,
    );

    await queryRunner.query(`DROP TYPE IF EXISTS "venues_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "venue_tables_type_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "reservations_tabletype_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "venues_type_enum" AS ENUM ('RESTAURANT','CAFE','CAFFE_BAR','LOUNGE','CLUB','FAST_FOOD','PIZZERIA','ROOFTOP','SPORTS_BAR','WINE_BAR','HOOKAH_LOUNGE','BAKERY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "venues" ALTER COLUMN "type" TYPE "venues_type_enum" USING "type"::"venues_type_enum"`,
    );

    await queryRunner.query(
      `CREATE TYPE "venue_tables_type_enum" AS ENUM ('STANDARD','BOOTH','BAR_SEAT','LOW_TABLE','HIGH_TABLE','TERRACE','VIP')`,
    );
    await queryRunner.query(
      `ALTER TABLE "venue_tables" ALTER COLUMN "type" TYPE "venue_tables_type_enum" USING "type"::"venue_tables_type_enum"`,
    );

    await queryRunner.query(
      `CREATE TYPE "reservations_tabletype_enum" AS ENUM ('STANDARD','BOOTH','BAR_SEAT','LOW_TABLE','HIGH_TABLE','TERRACE','VIP')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ALTER COLUMN "tableType" TYPE "reservations_tabletype_enum" USING "tableType"::"reservations_tabletype_enum"`,
    );
  }
}
