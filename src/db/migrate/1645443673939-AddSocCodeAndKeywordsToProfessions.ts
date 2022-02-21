import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocCodeAndKeywordsToProfessions1645443673939
  implements MigrationInterface
{
  name = 'AddSocCodeAndKeywordsToProfessions1645443673939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "keywords" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "socCode" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "socCode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "keywords"`,
    );
  }
}
