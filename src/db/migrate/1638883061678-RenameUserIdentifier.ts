import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserIdentifier1638883061678 implements MigrationInterface {
  name = 'RenameUserIdentifier1638883061678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "identifier" TO "externalIdentifier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME CONSTRAINT "UQ_2e7b7debda55e0e7280dc93663d" TO "UQ_21750875a4532d215d4eadaeff6"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME CONSTRAINT "UQ_21750875a4532d215d4eadaeff6" TO "UQ_2e7b7debda55e0e7280dc93663d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "externalIdentifier" TO "identifier"`,
    );
  }
}
