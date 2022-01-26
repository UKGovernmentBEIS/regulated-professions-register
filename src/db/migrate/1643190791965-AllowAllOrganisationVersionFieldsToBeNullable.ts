import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowAllOrganisationVersionFieldsToBeNullable1643190791965
  implements MigrationInterface
{
  name = 'AllowAllOrganisationVersionFieldsToBeNullable1643190791965';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "address" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "url" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "email" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "telephone" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "telephone" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "email" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "url" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ALTER COLUMN "address" SET NOT NULL`,
    );
  }
}
