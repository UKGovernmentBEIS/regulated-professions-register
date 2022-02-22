import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeAllQualificationFieldsNullable1645530015829
  implements MigrationInterface
{
  name = 'MakeAllQualificationFieldsNullable1645530015829';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "level" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "educationDuration" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "mandatoryProfessionalExperience" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "mandatoryProfessionalExperience" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "educationDuration" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "level" SET NOT NULL`,
    );
  }
}
