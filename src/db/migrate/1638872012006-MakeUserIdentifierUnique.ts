import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserIdentifierUnique1638872012006
  implements MigrationInterface
{
  name = 'MakeUserIdentifierUnique1638872012006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_2e7b7debda55e0e7280dc93663d" UNIQUE ("identifier")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_2e7b7debda55e0e7280dc93663d"`,
    );
  }
}
