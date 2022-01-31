import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDeprecatedQualifications1643631961111
  implements MigrationInterface
{
  name = 'RemoveDeprecatedQualifications1643631961111';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP CONSTRAINT "FK_5ffb2f85f5726da1365965a6106"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "professionVersionId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "professionVersionId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD CONSTRAINT "FK_5ffb2f85f5726da1365965a6106" FOREIGN KEY ("professionVersionId") REFERENCES "professionVersions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
