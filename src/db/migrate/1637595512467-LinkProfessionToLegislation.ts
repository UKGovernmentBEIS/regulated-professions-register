import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkProfessionToLegislation1637595512467
  implements MigrationInterface
{
  name = 'LinkProfessionToLegislation1637595512467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "professions_legislations_legislations" ("professionsId" uuid NOT NULL, "legislationsId" uuid NOT NULL, CONSTRAINT "PK_86f422f90b81644045c28af27da" PRIMARY KEY ("professionsId", "legislationsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d925b69c8adae1c16c18db892e" ON "professions_legislations_legislations" ("professionsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0a1e8656b9e9079e5bf06b97c8" ON "professions_legislations_legislations" ("legislationsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "professions_legislations_legislations" ADD CONSTRAINT "FK_d925b69c8adae1c16c18db892e0" FOREIGN KEY ("professionsId") REFERENCES "professions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions_legislations_legislations" ADD CONSTRAINT "FK_0a1e8656b9e9079e5bf06b97c80" FOREIGN KEY ("legislationsId") REFERENCES "legislations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions_legislations_legislations" DROP CONSTRAINT "FK_0a1e8656b9e9079e5bf06b97c80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions_legislations_legislations" DROP CONSTRAINT "FK_d925b69c8adae1c16c18db892e0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0a1e8656b9e9079e5bf06b97c8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d925b69c8adae1c16c18db892e"`,
    );
    await queryRunner.query(
      `DROP TABLE "professions_legislations_legislations"`,
    );
  }
}
