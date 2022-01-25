import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDataFieldsFromOrganisation1643127620717
  implements MigrationInterface
{
  name = 'RemoveDataFieldsFromOrganisation1643127620717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisations" DROP COLUMN "alternateName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" DROP COLUMN "address"`,
    );
    await queryRunner.query(`ALTER TABLE "organisations" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "organisations" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "organisations" DROP COLUMN "contactUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" DROP COLUMN "telephone"`,
    );
    await queryRunner.query(`ALTER TABLE "organisations" DROP COLUMN "fax"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "fax" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "telephone" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "contactUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "email" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "url" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "address" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "alternateName" character varying`,
    );
  }
}
