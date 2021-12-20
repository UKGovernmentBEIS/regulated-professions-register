import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfirmedFieldToProfessions1639999394470
  implements MigrationInterface
{
  name = 'AddConfirmedFieldToProfessions1639999394470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "confirmed" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "confirmed"`,
    );
  }
}
