import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdditionalOrganisationToProfessions1644579174098
  implements MigrationInterface
{
  name = 'AddAdditionalOrganisationToProfessions1644579174098';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "additionalOrganisationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_86e53b1b0a4604ede6ba4f743c5" FOREIGN KEY ("additionalOrganisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_86e53b1b0a4604ede6ba4f743c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "additionalOrganisationId"`,
    );
  }
}
