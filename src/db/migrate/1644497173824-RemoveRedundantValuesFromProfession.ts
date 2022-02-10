import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRedundantValuesFromProfession1644497173824
  implements MigrationInterface
{
  name = 'RemoveRedundantValuesFromProfession1644497173824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_e2c4688b8f8b296d88e0945f796"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_ad9cd8ba819522509b3cc2363a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "alternateName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "regulationType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "UQ_e2c4688b8f8b296d88e0945f796"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "qualificationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "occupationLocations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "confirmed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "mandatoryRegistration"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."professions_mandatoryregistration_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "reservedActivities"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "UQ_ad9cd8ba819522509b3cc2363a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "legislationId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "legislationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "UQ_ad9cd8ba819522509b3cc2363a4" UNIQUE ("legislationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "reservedActivities" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."professions_mandatoryregistration_enum" AS ENUM('mandatory', 'voluntary', 'unknown')`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "mandatoryRegistration" "public"."professions_mandatoryregistration_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "confirmed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "occupationLocations" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "qualificationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "UQ_e2c4688b8f8b296d88e0945f796" UNIQUE ("qualificationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "regulationType" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "alternateName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_ad9cd8ba819522509b3cc2363a4" FOREIGN KEY ("legislationId") REFERENCES "legislations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_e2c4688b8f8b296d88e0945f796" FOREIGN KEY ("qualificationId") REFERENCES "qualifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
