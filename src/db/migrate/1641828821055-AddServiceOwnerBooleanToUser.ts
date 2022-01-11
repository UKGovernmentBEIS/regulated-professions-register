import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceOwnerBooleanToUser1641828821055
  implements MigrationInterface
{
  name = 'AddServiceOwnerBooleanToUser1641828821055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "serviceOwner" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "serviceOwner"`);
  }
}
