import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndustriesToProfessions1638872081039
  implements MigrationInterface
{
  name = 'AddIndustriesToProfessions1638872081039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "professions" ADD "industryId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_20d8275b5a6001956e2a267e96c" FOREIGN KEY ("industryId") REFERENCES "industries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_20d8275b5a6001956e2a267e96c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "industryId"`,
    );
  }
}
