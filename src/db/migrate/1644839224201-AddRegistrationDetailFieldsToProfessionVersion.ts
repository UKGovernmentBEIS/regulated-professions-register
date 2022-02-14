import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRegistrationDetailFieldsToProfessionVersion1644839224201
  implements MigrationInterface
{
  name = 'AddRegistrationDetailFieldsToProfessionVersion1644839224201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "registrationRequirements" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "registrationUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "registrationUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "registrationRequirements"`,
    );
  }
}
