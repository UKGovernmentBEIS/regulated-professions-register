import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMandatoryRegistrationFromProfessions1646241094630
  implements MigrationInterface
{
  name = 'RemoveMandatoryRegistrationFromProfessions1646241094630';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "mandatoryRegistration"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."professionVersions_mandatoryregistration_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."professionVersions_mandatoryregistration_enum" AS ENUM('mandatory', 'voluntary', 'unknown')`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "mandatoryRegistration" "public"."professionVersions_mandatoryregistration_enum"`,
    );
  }
}
