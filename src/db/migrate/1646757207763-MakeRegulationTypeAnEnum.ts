import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeRegulationTypeAnEnum1646757207763
  implements MigrationInterface
{
  name = 'MakeRegulationTypeAnEnum1646757207763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "regulationType"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."professionVersions_regulationtype_enum" AS ENUM('licensing', 'certification', 'accreditation')`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "regulationType" "public"."professionVersions_regulationtype_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "regulationType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."professionVersions_regulationtype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "regulationType" character varying`,
    );
  }
}
