import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSlugFromOrganisationVersion1643143912283
  implements MigrationInterface
{
  name = 'RemoveSlugFromOrganisationVersion1643143912283';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e349c236153a972d31b5f72e67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "slug"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "slug" character varying`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e349c236153a972d31b5f72e67" ON "organisationVersions" ("slug") WHERE (slug IS NOT NULL)`,
    );
  }
}
