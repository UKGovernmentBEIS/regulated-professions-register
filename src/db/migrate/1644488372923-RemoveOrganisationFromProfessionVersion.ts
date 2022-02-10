import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOrganisationFromProfessionVersion1644488372923
  implements MigrationInterface
{
  name = 'RemoveOrganisationFromProfessionVersion1644488372923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP CONSTRAINT "FK_5ad0bb58fc31ea3e6c249739e42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" DROP COLUMN "organisationId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD "organisationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professionVersions" ADD CONSTRAINT "FK_5ad0bb58fc31ea3e6c249739e42" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
