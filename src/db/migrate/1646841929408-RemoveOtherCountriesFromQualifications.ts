import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOtherCountriesFromQualifications1646841929408
  implements MigrationInterface
{
  name = 'RemoveOtherCountriesFromQualifications1646841929408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherCountriesRecognition"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherCountriesRecognitionUrl"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherCountriesRecognitionUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherCountriesRecognition" character varying`,
    );
  }
}
