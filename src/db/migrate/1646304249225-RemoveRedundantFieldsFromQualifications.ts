import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRedundantFieldsFromQualifications1646304249225
  implements MigrationInterface
{
  name = 'RemoveRedundantFieldsFromQualifications1646304249225';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "qualifications" DROP COLUMN "level"`);
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "educationDuration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "mandatoryProfessionalExperience"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "mostCommonRouteToObtain"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "mostCommonRouteToObtain" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "mandatoryProfessionalExperience" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "educationDuration" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "level" character varying`,
    );
  }
}
