import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSingleLegislationToProfession1642179131892
  implements MigrationInterface
{
  name = 'AddSingleLegislationToProfession1642179131892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "legislationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "UQ_ad9cd8ba819522509b3cc2363a4" UNIQUE ("legislationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_ad9cd8ba819522509b3cc2363a4" FOREIGN KEY ("legislationId") REFERENCES "legislations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_ad9cd8ba819522509b3cc2363a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "UQ_ad9cd8ba819522509b3cc2363a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "legislationId"`,
    );
  }
}
