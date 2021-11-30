import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganisations1638188999748 implements MigrationInterface {
  name = 'CreateOrganisations1638188999748';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organisations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "alternateName" character varying, "address" character varying NOT NULL, "url" character varying NOT NULL, "email" character varying NOT NULL, "contactUrl" character varying, "telephone" character varying NOT NULL, "fax" character varying, CONSTRAINT "PK_7bf54cba378d5b2f1d4c10ef4df" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organisations"`);
  }
}
