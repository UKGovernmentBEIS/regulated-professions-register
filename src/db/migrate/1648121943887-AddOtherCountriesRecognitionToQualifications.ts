import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtherCountriesRecognitionToQualifications1648121943887
  implements MigrationInterface
{
  name = 'AddOtherCountriesRecognitionToQualifications1648121943887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherCountriesRecognitionSummary" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherCountriesRecognitionUrl" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."qualifications_othercountriesrecognitionroutes_enum" AS ENUM('none', 'some', 'all')`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherCountriesRecognitionRoutes" "public"."qualifications_othercountriesrecognitionroutes_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherCountriesRecognitionRoutes"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."qualifications_othercountriesrecognitionroutes_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherCountriesRecognitionUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherCountriesRecognitionSummary"`,
    );
  }
}
