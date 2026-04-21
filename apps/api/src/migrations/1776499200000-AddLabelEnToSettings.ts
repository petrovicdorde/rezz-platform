import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLabelEnToSettings1776499200000 implements MigrationInterface {
  name = 'AddLabelEnToSettings1776499200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "labelEn" varchar NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "labelEn"`);
  }
}
