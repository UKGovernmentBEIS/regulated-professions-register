import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUnconfirmedStatusToOrganisationVersion1643119746947
  implements MigrationInterface
{
  name = 'AddUnconfirmedStatusToOrganisationVersion1643119746947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."organisationVersions_status_enum" RENAME TO "organisationVersions_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organisationVersions_status_enum" AS ENUM('live', 'draft', 'archived', 'unconfirmed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "status" TYPE "public"."organisationVersions_status_enum" USING "status"::"text"::"public"."organisationVersions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organisationVersions_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."organisationVersions_status_enum" RENAME TO "organisationVersions_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organisationVersions_status_enum" AS ENUM('live', 'draft', 'archived')`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "status" TYPE "public"."organisationVersions_status_enum" USING "status"::"text"::"public"."organisationVersions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "status" SET DEFAULT 'draft'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."organisationVersions_status_enum_old"`,
    );
  }
}
