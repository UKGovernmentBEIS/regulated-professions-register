import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkProfessionsToOrganisations1638189658799
  implements MigrationInterface
{
  name = 'LinkProfessionsToOrganisations1638189658799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organisations_professions_professions" ("organisationsId" uuid NOT NULL, "professionsId" uuid NOT NULL, CONSTRAINT "PK_c268ed7d6fadbca0fbb3235f7c5" PRIMARY KEY ("organisationsId", "professionsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9ec1d94b540664d64a95e8ed8" ON "organisations_professions_professions" ("organisationsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4869f654502ff020fa3c855361" ON "organisations_professions_professions" ("professionsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations_professions_professions" ADD CONSTRAINT "FK_a9ec1d94b540664d64a95e8ed84" FOREIGN KEY ("organisationsId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations_professions_professions" ADD CONSTRAINT "FK_4869f654502ff020fa3c8553618" FOREIGN KEY ("professionsId") REFERENCES "professions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisations_professions_professions" DROP CONSTRAINT "FK_4869f654502ff020fa3c8553618"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations_professions_professions" DROP CONSTRAINT "FK_a9ec1d94b540664d64a95e8ed84"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4869f654502ff020fa3c855361"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a9ec1d94b540664d64a95e8ed8"`,
    );
    await queryRunner.query(
      `DROP TABLE "organisations_professions_professions"`,
    );
  }
}
