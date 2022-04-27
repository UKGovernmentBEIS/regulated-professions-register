import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmittedStatusToDecisionDatasets1651067648529
  implements MigrationInterface
{
  name = 'AddSubmittedStatusToDecisionDatasets1651067648529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."decision-datasets_status_enum" RENAME TO "decision-datasets_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."decision-datasets_status_enum" AS ENUM('unconfirmed', 'draft', 'submitted', 'live')`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" TYPE "public"."decision-datasets_status_enum" USING "status"::"text"::"public"."decision-datasets_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."decision-datasets_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."decision-datasets_status_enum_old" AS ENUM('unconfirmed', 'draft', 'live')`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" TYPE "public"."decision-datasets_status_enum_old" USING "status"::"text"::"public"."decision-datasets_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'-datasets_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."decision-datasets_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."decision-datasets_status_enum_old" RENAME TO "decision-datasets_status_enum"`,
    );
  }
}
