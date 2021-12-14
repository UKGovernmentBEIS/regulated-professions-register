import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowNullExternalIDs1639482803401 implements MigrationInterface {
  name = 'AllowNullExternalIDs1639482803401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "externalIdentifier" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_21750875a4532d215d4eadaeff6"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cc73de2c9b07b9926fcb5158b9" ON "users" ("externalIdentifier") WHERE "externalIdentifier" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc73de2c9b07b9926fcb5158b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_21750875a4532d215d4eadaeff6" UNIQUE ("externalIdentifier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "externalIdentifier" SET NOT NULL`,
    );
  }
}
