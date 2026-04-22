import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToVenues1776672000000
  implements MigrationInterface
{
  name = 'AddDescriptionToVenues1776672000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "description" text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "venues" DROP COLUMN IF EXISTS "description"`,
    );
  }
}
