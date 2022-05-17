import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyUserExternalIdentifierUniquenessConstraint1652355295227
  implements MigrationInterface
{
  name = 'ModifyUserExternalIdentifierUniquenessConstraint1652355295227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc73de2c9b07b9926fcb5158b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5b423e3ddcccabc257a997b9f1" ON "users" ("externalIdentifier") WHERE "externalIdentifier" IS NOT NULL AND "archived" = false AND "confirmed" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b423e3ddcccabc257a997b9f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'-datasets_status_enum"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cc73de2c9b07b9926fcb5158b9" ON "users" ("externalIdentifier") WHERE ("externalIdentifier" IS NOT NULL)`,
    );
  }
}
