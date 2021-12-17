import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfirmedFieldToUser1639656107767
  implements MigrationInterface
{
  name = 'AddConfirmedFieldToUser1639656107767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "confirmed" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "confirmed"`);
  }
}
