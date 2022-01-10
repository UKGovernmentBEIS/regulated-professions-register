import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugToOrganisation1641839765019 implements MigrationInterface {
  name = 'AddSlugToOrganisation1641839765019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "slug" character varying`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_33e00528c843c238825895273b" ON "organisations" ("slug") WHERE "slug" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_33e00528c843c238825895273b"`,
    );
    await queryRunner.query(`ALTER TABLE "organisations" DROP COLUMN "slug"`);
  }
}
