import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStringReservedActivities1641381772481
  implements MigrationInterface
{
  name = 'AddStringReservedActivities1641381772481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "reservedActivities" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "reservedActivities"`,
    );
  }
}
