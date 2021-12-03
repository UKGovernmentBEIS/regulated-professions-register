import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQualifications1638545051677 implements MigrationInterface {
  name = 'CreateQualifications1638545051677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "qualifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "level" character varying NOT NULL, "methodToObtain" character varying NOT NULL, "commonPathToObtain" character varying NOT NULL, "educationDuration" character varying NOT NULL, "mandatoryProfessionalExperience" boolean NOT NULL, CONSTRAINT "PK_9ed4d526ac3b76ba3f1c1080433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "qualifications"`);
  }
}
