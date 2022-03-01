import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArchivedFlagToUsers1646127089269 implements MigrationInterface {
  name = 'AddArchivedFlagToUsers1646127089269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "archived" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "archived"`);
  }
}
