import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeProfessionFieldsNullable1640095229241
  implements MigrationInterface
{
  name = 'MakeProfessionFieldsNullable1640095229241';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c60993e6f4badf770634fd393c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "alternateName" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "slug" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "UQ_c60993e6f4badf770634fd393c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "regulationType" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "reservedActivities" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_47cbed2342f1e1452b9af26f38" ON "professions" ("slug") WHERE "slug" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_47cbed2342f1e1452b9af26f38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "reservedActivities" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "regulationType" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "UQ_c60993e6f4badf770634fd393c7" UNIQUE ("slug")`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "slug" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "alternateName" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c60993e6f4badf770634fd393c" ON "professions" ("slug") `,
    );
  }
}
