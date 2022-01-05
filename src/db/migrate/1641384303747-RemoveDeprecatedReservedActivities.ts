import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDeprecatedReservedActivities1641384303747
  implements MigrationInterface
{
  name = 'RemoveDeprecatedReservedActivities1641384303747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "reservedActivitiesDeprecated"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "reservedActivitiesDeprecated" text array`,
    );
  }
}
