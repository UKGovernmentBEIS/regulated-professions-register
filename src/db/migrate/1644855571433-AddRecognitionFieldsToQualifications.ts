import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecognitionFieldsToQualifications1644855571433
  implements MigrationInterface
{
  name = 'AddRecognitionFieldsToQualifications1644855571433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "ukRecognition" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "ukRecognitionUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherCountriesRecognition" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherCountriesRecognitionUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherCountriesRecognitionUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherCountriesRecognition"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "ukRecognitionUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "ukRecognition"`,
    );
  }
}
