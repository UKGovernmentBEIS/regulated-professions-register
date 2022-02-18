import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAdditionalEducationDurations1645198143019
  implements MigrationInterface
{
  name = 'RemoveAdditionalEducationDurations1645198143019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDurationYears"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDurationMonths"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDurationDays"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDurationHours"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDurationHours" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDurationDays" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDurationMonths" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDurationYears" integer`,
    );
  }
}
