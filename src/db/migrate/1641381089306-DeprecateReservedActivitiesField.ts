import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeprecateReservedActivitiesField1641381089306
  implements MigrationInterface
{
  name = 'DeprecateReservedActivitiesField1641381089306';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" RENAME COLUMN "reservedActivities" TO "reservedActivitiesDeprecated"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" RENAME COLUMN "reservedActivitiesDeprecated" TO "reservedActivities"`,
    );
  }
}
