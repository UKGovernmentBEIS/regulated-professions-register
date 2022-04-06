import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDecisionDatasetStautsEnum1649255029983
  implements MigrationInterface
{
  name = 'RenameDecisionDatasetStautsEnum1649255029983';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ALTER COLUMN "status" SET DEFAULT 'unconfirmed'-datasets_status_enum"`,
    );
  }
}
