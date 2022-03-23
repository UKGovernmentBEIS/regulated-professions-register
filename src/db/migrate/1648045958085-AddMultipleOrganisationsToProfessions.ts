import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultipleOrganisationsToProfessions1648045958085
  implements MigrationInterface
{
  name = 'AddMultipleOrganisationsToProfessions1648045958085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."professionToOrganisation_role_enum" AS ENUM('primaryRegulator', 'charteredBody', 'qualifyingBody', 'additionalRegulator', 'oversightBody', 'enforcementBody', 'awardingBody')`,
    );
    await queryRunner.query(
      `CREATE TABLE "professionToOrganisation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."professionToOrganisation_role_enum", "organisationId" uuid, "professionId" uuid, CONSTRAINT "PK_a183e4f716c0b182ddec155d4c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionToOrganisation" ADD CONSTRAINT "FK_e3a593b482f4a238dfd5bd6ba9f" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionToOrganisation" ADD CONSTRAINT "FK_bde8c968b3caa2888cd699bbdcc" FOREIGN KEY ("professionId") REFERENCES "professions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionToOrganisation" DROP CONSTRAINT "FK_bde8c968b3caa2888cd699bbdcc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionToOrganisation" DROP CONSTRAINT "FK_e3a593b482f4a238dfd5bd6ba9f"`,
    );
    await queryRunner.query(`DROP TABLE "professionToOrganisation"`);
    await queryRunner.query(
      `DROP TYPE "public"."professionToOrganisation_role_enum"`,
    );
  }
}
