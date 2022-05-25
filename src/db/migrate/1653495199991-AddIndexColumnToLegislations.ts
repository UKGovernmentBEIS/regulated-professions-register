import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexColumnToLegislations1653495199991
  implements MigrationInterface
{
  name = 'AddIndexColumnToLegislations1653495199991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "legislations" ADD "index" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'-datasets_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "legislations" DROP COLUMN "index"`);
  }
}
