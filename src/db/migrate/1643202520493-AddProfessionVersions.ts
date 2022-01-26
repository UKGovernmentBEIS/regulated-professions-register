import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfessionVersions1643202520493 implements MigrationInterface {
  name = 'AddProfessionVersions1643202520493';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."professionVersions_status_enum" AS ENUM('live', 'draft', 'archived', 'unconfirmed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."professionVersions_mandatoryregistration_enum" AS ENUM('mandatory', 'voluntary', 'unknown')`,
    );
    await queryRunner.query(
      `CREATE TABLE "professionVersions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."professionVersions_status_enum" NOT NULL DEFAULT 'unconfirmed', "alternateName" character varying, "description" character varying, "occupationLocations" text array, "regulationType" character varying, "mandatoryRegistration" "public"."professionVersions_mandatoryregistration_enum", "reservedActivities" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "professionId" uuid, "userId" uuid, "organisationId" uuid, CONSTRAINT "PK_3e974f59ac7832c54ccd6724f85" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profession_versions_industries_industries" ("professionVersionsId" uuid NOT NULL, "industriesId" uuid NOT NULL, CONSTRAINT "PK_08aa4102a007f8188d5338c8909" PRIMARY KEY ("professionVersionsId", "industriesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_70e5dcf6e30759c33fede64c22" ON "profession_versions_industries_industries" ("professionVersionsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c52aff5f68771b2cf3c337d0ec" ON "profession_versions_industries_industries" ("industriesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "professionVersionId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "legislations" ADD "professionVersionId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD CONSTRAINT "FK_5ffb2f85f5726da1365965a6106" FOREIGN KEY ("professionVersionId") REFERENCES "professionVersions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD CONSTRAINT "FK_938f50ca3aa6c4c4f33f2bfc74f" FOREIGN KEY ("professionId") REFERENCES "professions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD CONSTRAINT "FK_1165c99291be6d0d80fdc63231b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD CONSTRAINT "FK_5ad0bb58fc31ea3e6c249739e42" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "legislations" ADD CONSTRAINT "FK_032301c773b01cabe9bef962196" FOREIGN KEY ("professionVersionId") REFERENCES "professionVersions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profession_versions_industries_industries" ADD CONSTRAINT "FK_70e5dcf6e30759c33fede64c22c" FOREIGN KEY ("professionVersionsId") REFERENCES "professionVersions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "profession_versions_industries_industries" ADD CONSTRAINT "FK_c52aff5f68771b2cf3c337d0ec2" FOREIGN KEY ("industriesId") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profession_versions_industries_industries" DROP CONSTRAINT "FK_c52aff5f68771b2cf3c337d0ec2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profession_versions_industries_industries" DROP CONSTRAINT "FK_70e5dcf6e30759c33fede64c22c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "legislations" DROP CONSTRAINT "FK_032301c773b01cabe9bef962196"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP CONSTRAINT "FK_5ad0bb58fc31ea3e6c249739e42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP CONSTRAINT "FK_1165c99291be6d0d80fdc63231b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP CONSTRAINT "FK_938f50ca3aa6c4c4f33f2bfc74f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP CONSTRAINT "FK_5ffb2f85f5726da1365965a6106"`,
    );
    await queryRunner.query(
      `ALTER TABLE "legislations" DROP COLUMN "professionVersionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "professionVersionId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c52aff5f68771b2cf3c337d0ec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_70e5dcf6e30759c33fede64c22"`,
    );
    await queryRunner.query(
      `DROP TABLE "profession_versions_industries_industries"`,
    );
    await queryRunner.query(`DROP TABLE "professionVersions"`);
    await queryRunner.query(
      `DROP TYPE "public"."professionVersions_mandatoryregistration_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."professionVersions_status_enum"`,
    );
  }
}
