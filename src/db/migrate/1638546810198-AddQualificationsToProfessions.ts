import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQualificationsToProfessions1638546810198
  implements MigrationInterface
{
  name = 'AddQualificationsToProfessions1638546810198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" RENAME COLUMN "qualificationLevel" TO "qualificationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "qualificationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "qualificationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_e2c4688b8f8b296d88e0945f796" FOREIGN KEY ("qualificationId") REFERENCES "qualifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_e2c4688b8f8b296d88e0945f796"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "qualificationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "qualificationId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" RENAME COLUMN "qualificationId" TO "qualificationLevel"`,
    );
  }
}
