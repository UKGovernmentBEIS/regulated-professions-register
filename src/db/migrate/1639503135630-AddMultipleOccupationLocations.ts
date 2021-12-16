import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultipleOccupationLocations1639503135630
  implements MigrationInterface
{
  name = 'AddMultipleOccupationLocations1639503135630';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" RENAME COLUMN "occupationLocation" TO "occupationLocations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "occupationLocations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "occupationLocations" text array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "occupationLocations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "occupationLocations" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" RENAME COLUMN "occupationLocations" TO "occupationLocation"`,
    );
  }
}
