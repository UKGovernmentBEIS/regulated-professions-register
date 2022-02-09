import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRegulationInformation1644427544093
  implements MigrationInterface
{
  name = 'AddRegulationInformation1644427544093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "protectedTitles" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "regulationUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "regulationUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "protectedTitles"`,
    );
  }
}
