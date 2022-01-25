import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveOrganisationFieldsToVersion1643120329469
  implements MigrationInterface
{
  name = 'MoveOrganisationFieldsToVersion1643120329469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "alternateName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "address" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "url" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "email" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "contactUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "telephone" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "fax" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP CONSTRAINT "FK_81a209c70f4c7e5a9743e6cb077"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP CONSTRAINT "REL_81a209c70f4c7e5a9743e6cb07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD CONSTRAINT "FK_81a209c70f4c7e5a9743e6cb077" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP CONSTRAINT "FK_81a209c70f4c7e5a9743e6cb077"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD CONSTRAINT "REL_81a209c70f4c7e5a9743e6cb07" UNIQUE ("organisationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD CONSTRAINT "FK_81a209c70f4c7e5a9743e6cb077" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "fax"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "telephone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "contactUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "alternateName"`,
    );
  }
}
