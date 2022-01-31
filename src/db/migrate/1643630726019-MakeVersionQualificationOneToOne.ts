import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeVersionQualificationOneToOne1643630726019
  implements MigrationInterface
{
  name = 'MakeVersionQualificationOneToOne1643630726019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "qualificationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD CONSTRAINT "UQ_7014b0340008f5967b794c4385c" UNIQUE ("qualificationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD CONSTRAINT "FK_7014b0340008f5967b794c4385c" FOREIGN KEY ("qualificationId") REFERENCES "qualifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP CONSTRAINT "FK_7014b0340008f5967b794c4385c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP CONSTRAINT "UQ_7014b0340008f5967b794c4385c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "qualificationId"`,
    );
  }
}
