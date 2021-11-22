import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfessions1637588035122 implements MigrationInterface {
  name = 'CreateProfessions1637588035122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "professions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "alternateName" character varying NOT NULL, "description" character varying NOT NULL, "occupationLocation" character varying NOT NULL, "regulationType" character varying NOT NULL, "qualificationLevel" character varying NOT NULL, "reservedActivities" text array NOT NULL, CONSTRAINT "PK_9247c0d4b30fc6b796d59262058" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "professions"`);
  }
}
