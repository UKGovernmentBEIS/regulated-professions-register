import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganisationVersion1642781768700 implements MigrationInterface {
  name = 'AddOrganisationVersion1642781768700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organisationVersions_status_enum" AS ENUM('live', 'draft', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "organisationVersions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying, "status" "public"."organisationVersions_status_enum" NOT NULL DEFAULT 'draft', "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "organisationId" uuid, "userId" uuid, CONSTRAINT "REL_81a209c70f4c7e5a9743e6cb07" UNIQUE ("organisationId"), CONSTRAINT "PK_2f5f9d21aa796fc308e09489350" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e349c236153a972d31b5f72e67" ON "organisationVersions" ("slug") WHERE "slug" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD CONSTRAINT "FK_81a209c70f4c7e5a9743e6cb077" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD CONSTRAINT "FK_37c90fe3da5c8598ac272ef1a87" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP CONSTRAINT "FK_37c90fe3da5c8598ac272ef1a87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP CONSTRAINT "FK_81a209c70f4c7e5a9743e6cb077"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e349c236153a972d31b5f72e67"`,
    );
    await queryRunner.query(`DROP TABLE "organisationVersions"`);
    await queryRunner.query(
      `DROP TYPE "public"."organisationVersions_status_enum"`,
    );
  }
}
