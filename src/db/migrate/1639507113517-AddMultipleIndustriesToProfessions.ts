import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultipleIndustriesToProfessions1639507113517
  implements MigrationInterface
{
  name = 'AddMultipleIndustriesToProfessions1639507113517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_20d8275b5a6001956e2a267e96c"`,
    );
    await queryRunner.query(
      `CREATE TABLE "professions_industries_industries" ("professionsId" uuid NOT NULL, "industriesId" uuid NOT NULL, CONSTRAINT "PK_9ec94c1a394fdfa3c771db861ad" PRIMARY KEY ("professionsId", "industriesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b2dce3e05d62eb3513b8a9da4" ON "professions_industries_industries" ("professionsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4728e508efa4cd880af8dc0e25" ON "professions_industries_industries" ("industriesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "industryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions_industries_industries" ADD CONSTRAINT "FK_2b2dce3e05d62eb3513b8a9da48" FOREIGN KEY ("professionsId") REFERENCES "professions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions_industries_industries" ADD CONSTRAINT "FK_4728e508efa4cd880af8dc0e259" FOREIGN KEY ("industriesId") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions_industries_industries" DROP CONSTRAINT "FK_4728e508efa4cd880af8dc0e259"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions_industries_industries" DROP CONSTRAINT "FK_2b2dce3e05d62eb3513b8a9da48"`,
    );
    await queryRunner.query(`ALTER TABLE "professions" ADD "industryId" uuid`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4728e508efa4cd880af8dc0e25"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2b2dce3e05d62eb3513b8a9da4"`,
    );
    await queryRunner.query(`DROP TABLE "professions_industries_industries"`);
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_20d8275b5a6001956e2a267e96c" FOREIGN KEY ("industryId") REFERENCES "industries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
