import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugToProfession1639393653586 implements MigrationInterface {
  name = 'AddSlugToProfession1639393653586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "slug" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "UQ_c60993e6f4badf770634fd393c7" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c60993e6f4badf770634fd393c" ON "professions" ("slug") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c60993e6f4badf770634fd393c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "UQ_c60993e6f4badf770634fd393c7"`,
    );
    await queryRunner.query(`ALTER TABLE "professions" DROP COLUMN "slug"`);
  }
}
