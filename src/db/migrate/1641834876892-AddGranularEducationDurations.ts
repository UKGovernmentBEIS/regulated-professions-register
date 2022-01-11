import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGranularEducationDurations1641834876892
  implements MigrationInterface
{
  name = 'AddGranularEducationDurations1641834876892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDurationYears" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDurationMonths" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDurationDays" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDurationHours" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDurationHours"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDurationDays"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDurationMonths"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDurationYears"`,
    );
  }
}
