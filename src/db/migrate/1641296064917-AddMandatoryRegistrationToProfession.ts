import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMandatoryRegistrationToProfession1641296064917
  implements MigrationInterface
{
  name = 'AddMandatoryRegistrationToProfession1641296064917';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."professions_mandatoryregistration_enum" AS ENUM('mandatory', 'voluntary', 'unknown')`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "mandatoryRegistration" "public"."professions_mandatoryregistration_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "mandatoryRegistration"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."professions_mandatoryregistration_enum"`,
    );
  }
}
