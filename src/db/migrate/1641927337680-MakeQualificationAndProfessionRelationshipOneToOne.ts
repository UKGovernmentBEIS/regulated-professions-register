import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeQualificationAndProfessionRelationshipOneToOne1641927337680
  implements MigrationInterface
{
  name = 'MakeQualificationAndProfessionRelationshipOneToOne1641927337680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_e2c4688b8f8b296d88e0945f796"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "UQ_e2c4688b8f8b296d88e0945f796" UNIQUE ("qualificationId")`,
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
      `ALTER TABLE "professions" DROP CONSTRAINT "UQ_e2c4688b8f8b296d88e0945f796"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_e2c4688b8f8b296d88e0945f796" FOREIGN KEY ("qualificationId") REFERENCES "qualifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
